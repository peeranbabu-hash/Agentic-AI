const logs = [];
let io;

export function configureLogger(socketServer) { io = socketServer; }
export function clearLogs() { logs.length = 0; }
export function getLogs() { return logs; }
export function record(event, message) {
  const entry = { id: `${Date.now()}-${logs.length}`, event, ...message, timestamp: new Date().toISOString() };
  logs.push(entry);
  io?.emit('communication:update', entry);
  io?.emit(`agent:${event}`, entry);
  return entry;
}
