let sequence = 0;
export function createMessage({ sender, receiver, type = 'REQUEST', action = 'process', payload = {}, requestId }) {
  sequence += 1;
  const messageId = `${type === 'REQUEST' ? 'REQ' : 'RES'}-${String(sequence).padStart(3, '0')}`;
  return { messageId, ...(requestId ? { requestId } : {}), sender, receiver, type, action, payload, timestamp: new Date().toISOString() };
}
export function wait(milliseconds = 450) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
