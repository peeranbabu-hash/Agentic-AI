const definitions = [
  ['Agent-A', 'Request Agent', 'Captures and dispatches user requests'],
  ['Agent-B', 'Data Processor', 'Structures and enriches incoming data'],
  ['Agent-C', 'Analysis Agent', 'Interprets signals and finds meaning'],
  ['Agent-D', 'Validation Agent', 'Checks the result for confidence'],
  ['Agent-E', 'Response Agent', 'Turns validated output into an answer']
];

const agents = definitions.map(([id, name, role]) => ({ id, name, role, status: 'Idle', incoming: 0, outgoing: 0 }));

export function getAgents() { return agents; }
export function getAgent(id) { return agents.find((agent) => agent.id === id); }
export function setStatus(id, status) {
  const agent = getAgent(id);
  if (agent) agent.status = status;
  return agent;
}
export function resetStatuses() { agents.forEach((agent) => { agent.status = 'Idle'; }); }
