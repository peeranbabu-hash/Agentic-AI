# Multi-Agent Communication Framework

A full-stack educational simulation of three multi-agent communication architectures: centralized routing, sequential pipelines, and direct peer-to-peer delegation.

## Requirements

- Node.js 18 or newer and npm

## Install and run

```bash
npm run install:all
npm run dev
```

The Vite dashboard opens at `http://localhost:5173`; the Express and Socket.IO API runs at `http://localhost:4000`.

## Architectures

- **Centralized:** Agent A sends to a Central Controller, which routes to a required agent and returns the response.
- **Sequential / Pipeline:** A request moves through Agents A, B, C, D, and E. Each stage enriches the payload.
- **Peer-to-Peer:** Agents choose direct peers with no controller: A -> C -> B -> D -> A.

## API

`GET /api/agents` returns current agent states. `GET /api/logs` returns the in-memory communication trace. `GET /api/status` returns server and active-agent status.

`POST /api/request` accepts JSON:

```json
{"architecture":"pipeline","message":"Analyze temperature = 85 C","temperature":85}
```

The response includes the original request, final result, and path. Socket.IO emits `communication:update` for every send and receive event, plus `agent:send` and `agent:receive`.

## Structure

- `client/src/main.jsx` - dashboard, controls, visualization, and live Socket.IO log
- `client/src/styles.css` - responsive visual system
- `server/architectures/` - the three runnable communication strategies
- `server/agents/agentManager.js` - in-memory agent registry and status
- `server/services/` - message protocol and event logger
- `server/server.js` - Express API and Socket.IO server

## Future improvements

Persist runs, add configurable agent graphs, support richer payload schemas, and add automated integration tests for timeout and unavailable-agent scenarios.
