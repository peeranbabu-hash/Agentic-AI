import React from 'react';
import { createRoot } from 'react-dom/client';
import { io } from 'socket.io-client';
import { Activity, ArrowRight, CheckCircle2, CircleAlert, Cpu, Network, Play, Radio, RotateCcw, Send, Workflow } from 'lucide-react';
import './styles.css';

const API = 'http://localhost:4000';
const architectures = [
  { id: 'centralized', label: 'Centralized', icon: Network, note: 'One controller routes every exchange.' },
  { id: 'pipeline', label: 'Sequential / Pipeline', icon: Workflow, note: 'Every agent adds a processing step.' },
  { id: 'peer-to-peer', label: 'Peer-to-Peer', icon: Radio, note: 'Agents delegate directly to peers.' }
];
const scenarios = [
  { label: 'Temperature Analysis', message: 'Analyze temperature = 85 C', temperature: 85 },
  { label: 'Sensor Fault Detection', message: 'Check sensor integrity', temperature: 85 },
  { label: 'Production Optimization', message: 'Optimize production line', temperature: 72 },
  { label: 'Maintenance Request', message: 'Assess maintenance priority', temperature: 60 }
];

function App() {
  const [architecture, setArchitecture] = React.useState('centralized');
  const [scenario, setScenario] = React.useState(scenarios[0]);
  const [message, setMessage] = React.useState(scenarios[0].message);
  const [agents, setAgents] = React.useState([]); const [logs, setLogs] = React.useState([]);
  const [response, setResponse] = React.useState('Ready for a request.'); const [busy, setBusy] = React.useState(false); const [error, setError] = React.useState('');
  React.useEffect(() => { fetch(`${API}/api/agents`).then((res) => res.json()).then(setAgents).catch(() => setError('Server offline. Start the backend on port 4000.')); const socket = io(API); socket.on('communication:update', (entry) => setLogs((current) => [...current, entry])); return () => socket.disconnect(); }, []);
  const selectScenario = (value) => { const selected = scenarios.find((item) => item.label === value) || scenarios[0]; setScenario(selected); setMessage(selected.message); };
  const sendRequest = async () => { setBusy(true); setError(''); setResponse('Agents are communicating...'); setLogs([]); try { const result = await fetch(`${API}/api/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ architecture, message, temperature: scenario.temperature }) }); const data = await result.json(); if (!result.ok) throw new Error(data.error); setResponse(data.result); setAgents(await fetch(`${API}/api/agents`).then((res) => res.json())); } catch (requestError) { setError(requestError.message); setResponse('No response received.'); } finally { setBusy(false); } };
  const activeArchitecture = architectures.find((item) => item.id === architecture);
  return <main className="app-shell">
    <header className="topbar"><div className="brand-mark"><Cpu size={21} /></div><div><p className="eyebrow">SYSTEMS LAB / LIVE SIMULATION</p><h1>Multi-Agent Communication Framework</h1></div><div className="connection"><span className="pulse" /> Backend <strong>online</strong></div></header>
    <section className="intro"><div><p className="eyebrow accent">COMMUNICATION TOPOLOGY</p><h2>Watch the request<br /><em>find its way.</em></h2></div><p className="intro-copy">Compare three coordination patterns in a working, observable agent network. Every arrow below is a real message emitted by the server.</p></section>
    <section className="architecture-grid">{architectures.map(({ id, label, icon: Icon, note }) => <button className={`architecture-card ${architecture === id ? 'selected' : ''}`} onClick={() => setArchitecture(id)} key={id}><Icon size={20} /><span>{label}</span><small>{note}</small><b>{architecture === id ? 'ACTIVE' : 'SELECT'}</b></button>)}</section>
    <section className="workspace-grid"><div className="panel request-panel"><div className="panel-heading"><div><p className="eyebrow">01 / DISPATCH</p><h3>Launch a request</h3></div><Activity size={20} /></div><label>Test scenario<select value={scenario.label} onChange={(event) => selectScenario(event.target.value)}>{scenarios.map((item) => <option key={item.label}>{item.label}</option>)}</select></label><label>Request payload<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows="4" /></label><button className="send-button" disabled={busy} onClick={sendRequest}>{busy ? <><Activity className="spin" size={18} /> Communicating</> : <><Send size={18} /> Send request</>}<ArrowRight size={18} /></button>{error && <p className="error"><CircleAlert size={16} />{error}</p>}</div>
      <div className="panel visualization"><div className="panel-heading"><div><p className="eyebrow">02 / NETWORK</p><h3>{activeArchitecture.label}</h3></div><span className="live-tag"><span className="pulse" /> LIVE</span></div><div className="topology">{(architecture === 'centralized' ? ['Agent-A', 'Controller', 'Agent-C', 'Agent-A'] : architecture === 'pipeline' ? ['Agent-A', 'Agent-B', 'Agent-C', 'Agent-D', 'Agent-E'] : ['Agent-A', 'Agent-C', 'Agent-B', 'Agent-D', 'Agent-A']).map((id, index, path) => <React.Fragment key={`${id}-${index}`}><div className={`node ${agents.find((agent) => agent.id === id)?.status?.toLowerCase() || ''}`}><span>{id === 'Controller' ? 'CTR' : id.replace('Agent-', '')}</span><small>{id === 'Controller' ? 'Router' : agents.find((agent) => agent.id === id)?.status || 'Idle'}</small></div>{index < path.length - 1 && <ArrowRight className="topology-arrow" size={19} />}</React.Fragment>)}</div><div className="legend"><span><i className="dot idle" /> Idle</span><span><i className="dot processing" /> Processing</span><span><i className="dot completed" /> Completed</span></div></div>
    </section>
    <section className="lower-grid"><div className="panel log-panel"><div className="panel-heading"><div><p className="eyebrow">03 / TRACE</p><h3>Communication log</h3></div><span className="log-count">{logs.length} EVENTS</span></div><div className="log-list">{logs.length ? logs.map((log) => <div className="log-row" key={log.id}><time>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time><span className={`event-pill ${log.event}`}>{log.event}</span><strong>{log.sender}</strong><ArrowRight size={15} /><strong>{log.receiver}</strong><code>{log.type} / {log.action}</code></div>) : <div className="empty-state"><RotateCcw size={18} /> Send a request to reveal the live trace.</div>}</div></div><div className="panel response-panel"><p className="eyebrow">04 / OUTPUT</p><h3>Final response</h3><div className="response-box"><CheckCircle2 size={22} /><p>{response}</p></div><div className="stat-row"><span>Architecture<strong>{activeArchitecture.label}</strong></span><span>Agents<strong>{agents.length || 5} online</strong></span></div></div></section>
    <section className="comparison"><div><p className="eyebrow">FIELD NOTES</p><h3>Architecture comparison</h3></div><div className="comparison-table"><div className="table-row table-head"><span>Feature</span><span>Centralized</span><span>Pipeline</span><span>Peer-to-Peer</span></div>{[['Controller', 'Yes', 'No', 'No'], ['Communication', 'Through controller', 'Sequential', 'Direct'], ['Flexibility', 'Medium', 'Low', 'High'], ['Fault tolerance', 'Low', 'Medium', 'High'], ['Complexity', 'Low', 'Low', 'High']].map((row) => <div className="table-row" key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}</div></section>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
