import { getAgent, setStatus } from '../agents/agentManager.js';
import { createMessage, wait } from '../services/messageService.js';
import { record } from '../services/logger.js';

export async function runCentralized(request) {
  const target = request.payload.temperature !== undefined ? 'Agent-C' : 'Agent-B';
  const controller = 'Controller';
  const outbound = createMessage({ sender: 'Agent-A', receiver: controller, action: 'route', payload: request.payload });
  record('send', outbound); setStatus('Agent-A', 'Sending'); await wait(); record('receive', outbound);
  const routed = createMessage({ sender: controller, receiver: target, action: 'route', payload: request.payload, requestId: outbound.messageId });
  record('send', routed); setStatus(target, 'Receiving'); await wait(); record('receive', routed); setStatus(target, 'Processing');
  await wait();
  const result = request.payload.temperature > 75 ? 'HIGH' : 'NORMAL';
  const response = createMessage({ sender: target, receiver: controller, type: 'RESPONSE', action: 'analyze', payload: { result }, requestId: outbound.messageId });
  record('send', response); setStatus(target, 'Sending'); await wait(); record('receive', response);
  const final = createMessage({ sender: controller, receiver: 'Agent-A', type: 'RESPONSE', action: 'complete', payload: { result }, requestId: outbound.messageId });
  record('send', final); setStatus('Agent-A', 'Receiving'); await wait(); record('receive', final); setStatus('Agent-A', 'Completed'); setStatus(target, 'Completed');
  return { result, path: ['Agent-A', 'Controller', target, 'Controller', 'Agent-A'] };
}
