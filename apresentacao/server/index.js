/**
 * Servidor WebSocket de Sinalização — Controle Remoto da Apresentação
 * Vinícola-Modelo & Lean · FGEC UFRGS 2026/1
 *
 * Gerencia salas de apresentação com IDs de 4 dígitos.
 * Um "host" (computador/projetor) e N "remotes" (celulares) se conectam
 * à mesma sala pelo mesmo sessionId para trocar comandos e estado.
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const APP_ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

// Estrutura de salas: { '1234': { host: ws | null, remotes: [ws, ...] } }
const rooms = {};

// ─── Servidor HTTP + WS na mesma porta ────────────────────────────────────────
// O health check do Coolify/Traefik faz HTTP GET / e espera 200.
// O WebSocket usa a mesma porta via upgrade de protocolo.
const httpServer = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    const pathname = getPathname(req.url);
    if (pathname === '/health') {
      const status = { status: 'ok', rooms: Object.keys(rooms).length };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status));
      return;
    }
  }

  serveStatic(req, res);
});

const wss = new WebSocketServer({ server: httpServer });
httpServer.listen(PORT, () => {
  console.log(`✅ Servidor HTTP+WebSocket ativo na porta ${PORT}`);
});

wss.on('connection', (ws) => {
  let sessionId = null;
  let role = null; // 'host' | 'remote'

  // ─── Heartbeat para manter a conexão viva (importante no Nginx/Coolify) ───
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return; // Ignora mensagens malformadas
    }

    // ── 1. REGISTRO NA SALA ──────────────────────────────────────────────────
    if (data.type === 'register') {
      sessionId = String(data.sessionId).slice(0, 8); // Sanitiza
      role = data.role === 'host' ? 'host' : 'remote';

      if (!rooms[sessionId]) {
        rooms[sessionId] = { host: null, remotes: [] };
      }

      if (role === 'host') {
        rooms[sessionId].host = ws;
        console.log(`[Host] conectado na sala ${sessionId}`);
        // Confirma conexão ao host
        send(ws, { type: 'registered', role: 'host', sessionId });
      } else {
        rooms[sessionId].remotes.push(ws);
        const count = rooms[sessionId].remotes.length;
        console.log(`[Remote] conectado na sala ${sessionId} (total: ${count})`);
        // Confirma conexão ao remoto
        send(ws, { type: 'registered', role: 'remote', sessionId });
        // Pede ao host que envie o estado atual para sincronizar o remoto
        if (rooms[sessionId].host?.readyState === ws.OPEN) {
          send(rooms[sessionId].host, { type: 'request-state' });
        }
      }
      return;
    }

    // ── 2. COMANDO DO CELULAR → HOST ─────────────────────────────────────────
    // Tipos esperados: { type:'command', action:'next'|'prev'|'goto', slideIndex?: N }
    if (data.type === 'command' && role === 'remote' && sessionId) {
      const host = rooms[sessionId]?.host;
      if (host?.readyState === ws.OPEN) {
        send(host, data);
      }
      return;
    }

    // ── 3. ATUALIZAÇÃO DE ESTADO DO HOST → TODOS OS REMOTOS ─────────────────
    // Payload: { type:'state-update', slideIndex, stepIndex, slideTitle, speakerScript }
    if (data.type === 'state-update' && role === 'host' && sessionId) {
      const remotes = rooms[sessionId]?.remotes ?? [];
      remotes.forEach(r => {
        if (r.readyState === ws.OPEN) send(r, data);
      });
      return;
    }
  });

  ws.on('close', () => {
    if (!sessionId || !rooms[sessionId]) return;

    if (role === 'host') {
      rooms[sessionId].host = null;
      console.log(`[Host] desconectado da sala ${sessionId}`);
      // Notifica remotos que o host caiu
      rooms[sessionId].remotes.forEach(r => {
        if (r.readyState === ws.OPEN) send(r, { type: 'host-disconnected' });
      });
    } else {
      rooms[sessionId].remotes = rooms[sessionId].remotes.filter(r => r !== ws);
      console.log(`[Remote] desconectado da sala ${sessionId}`);
    }

    // Limpa salas completamente vazias
    if (!rooms[sessionId].host && rooms[sessionId].remotes.length === 0) {
      delete rooms[sessionId];
      console.log(`[Room] sala ${sessionId} encerrada`);
    }
  });

  ws.on('error', (err) => {
    console.error(`[WS Error]`, err.message);
  });
});

// ─── Heartbeat Periódico (detecta conexões zumbis) ───────────────────────────
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => clearInterval(heartbeatInterval));

// ─── Helper ──────────────────────────────────────────────────────────────────
function send(ws, data) {
  try {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  } catch (e) {
    console.error('[send error]', e.message);
  }
}

function getPathname(url) {
  return new URL(url, 'http://localhost').pathname;
}

function getSiteFromHost(hostHeader = '') {
  const host = hostHeader.split(':')[0].toLowerCase();
  if (host.startsWith('apresentador.')) return 'apresentador';
  if (host.startsWith('remoto.')) return 'remoto';
  return 'main';
}

function safeJoin(baseDir, relativePath) {
  const targetPath = path.resolve(baseDir, relativePath);
  if (!targetPath.startsWith(baseDir)) return null;
  return targetPath;
}

function tryServeFile(filePath, res) {
  if (!filePath || !fs.existsSync(filePath)) return false;

  const stats = fs.statSync(filePath);
  if (!stats.isFile()) return false;

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function serveStatic(req, res) {
  const pathname = getPathname(req.url);
  const site = getSiteFromHost(req.headers.host);
  const presenterRoot = path.join(APP_ROOT, 'apresentador');
  const remoteRoot = path.join(APP_ROOT, 'remoto');

  if (pathname === '/' || pathname === '') {
    if (site === 'apresentador') {
      if (tryServeFile(path.join(presenterRoot, 'index.html'), res)) return;
    } else if (site === 'remoto') {
      if (tryServeFile(path.join(remoteRoot, 'index.html'), res)) return;
    } else if (tryServeFile(path.join(APP_ROOT, 'index.html'), res)) {
      return;
    }
  }

  if (pathname === '/apresentador' || pathname === '/apresentador/') {
    if (tryServeFile(path.join(presenterRoot, 'index.html'), res)) return;
  }

  if (pathname === '/remoto' || pathname === '/remoto/') {
    if (tryServeFile(path.join(remoteRoot, 'index.html'), res)) return;
  }

  if (pathname.startsWith('/apresentador/')) {
    const localPath = safeJoin(presenterRoot, pathname.replace('/apresentador/', ''));
    if (tryServeFile(localPath, res)) return;
  }

  if (pathname.startsWith('/remoto/')) {
    const localPath = safeJoin(remoteRoot, pathname.replace('/remoto/', ''));
    if (tryServeFile(localPath, res)) return;
  }

  const appLocalPath = safeJoin(APP_ROOT, pathname.slice(1));
  if (tryServeFile(appLocalPath, res)) return;

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}
