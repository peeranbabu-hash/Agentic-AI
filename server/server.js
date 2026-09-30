import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'node:http';
import { getAgents, resetStatuses } from './agents/agentManager.js';
import { getLogs, clearLogs, configureLogger } from './services/logger.js';
import { createMessage } from './services/messageService.js';
import { runCentralized } from './architectures/centralized.js';
import { runPipeline } from './architectures/pipeline.js';
import { runPeerToPeer } from './architectures/peerToPeer.js';

const app = express(); const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } }); configureLogger(io);
app.use(cors()); app.use(express.json());
app.get('/api/agents', (_req, res) => res.json(getAgents()));
app.get('/api/logs', (_req, res) => res.json(getLogs()));
app.get('/api/status', (_req, res) => res.json({ online: true, activeAgents: getAgents().filter((agent) => agent.status !== 'Idle').length }));
app.post('/api/request', async (req, res) => {
  const { architecture = 'centralized', message = 'Analyze temperature = 85 C', temperature = 85 } = req.body ?? {};
  if (!['centralized', 'pipeline', 'peer-to-peer'].includes(architecture)) return res.status(400).json({ error: 'Invalid architecture.' });
  if (!message.trim()) return res.status(400).json({ error: 'Request message is required.' });
  clearLogs(); resetStatuses();
  const request = createMessage({ sender: 'Agent-A', receiver: 'system', action: 'analyze', payload: { temperature, message } });
  try {
    const runner = { centralized: runCentralized, pipeline: runPipeline, 'peer-to-peer': runPeerToPeer }[architecture];
    const result = await runner(request); res.json({ request, ...result });
  } catch (error) { res.status(500).json({ error: error.message || 'Communication failed.' }); }
});
io.on('connection', (socket) => { socket.emit('communication:ready', { connected: true }); });
const port = process.env.PORT || 4000; httpServer.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
