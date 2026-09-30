import { setStatus } from '../agents/agentManager.js';
import { createMessage, wait } from '../services/messageService.js';
import { record } from '../services/logger.js';

export async function runPeerToPeer(request) {
  const path = ['Agent-A', 'Agent-C', 'Agent-B', 'Agent-D', 'Agent-A'];
  let payload = request.payload;
  for (let index = 0; index < path.length - 1; index += 1) {
    const message = createMessage({ sender: path[index], receiver: path[index + 1], action: 'delegate', payload, requestId: request.messageId });
    setStatus(path[index], 'Sending'); record('send', message); await wait(); setStatus(path[index + 1], 'Receiving'); record('receive', message); setStatus(path[index + 1], 'Processing');
    if (path[index + 1] === 'Agent-C') payload = { ...payload, result: payload.temperature > 75 ? 'HIGH' : 'NORMAL' };
    if (path[index + 1] === 'Agent-D') payload = { ...payload, validated: true };
  }
  setStatus('Agent-A', 'Completed'); return { result: payload.result === 'HIGH' ? 'Temperature is above normal.' : 'Temperature is within normal range.', path };
}
