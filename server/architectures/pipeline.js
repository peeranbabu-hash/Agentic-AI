import { setStatus } from '../agents/agentManager.js';
import { createMessage, wait } from '../services/messageService.js';
import { record } from '../services/logger.js';

export async function runPipeline(request) {
  const path = ['Agent-A', 'Agent-B', 'Agent-C', 'Agent-D', 'Agent-E'];
  let payload = request.payload;
  for (let index = 0; index < path.length - 1; index += 1) {
    const message = createMessage({ sender: path[index], receiver: path[index + 1], action: index === 0 ? 'process' : 'continue', payload, requestId: request.messageId });
    setStatus(path[index], 'Sending'); record('send', message); await wait(); setStatus(path[index + 1], 'Receiving'); record('receive', message); setStatus(path[index + 1], 'Processing');
    if (path[index + 1] === 'Agent-B') payload = { ...payload, processed: true };
    if (path[index + 1] === 'Agent-C') payload = { ...payload, result: payload.temperature > 75 ? 'HIGH' : 'NORMAL' };
    if (path[index + 1] === 'Agent-D') payload = { ...payload, validated: true };
  }
  setStatus('Agent-E', 'Completed'); return { result: payload.result === 'HIGH' ? 'Temperature is above normal.' : 'Temperature is within normal range.', path };
}
