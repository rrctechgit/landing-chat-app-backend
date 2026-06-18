const { WebSocketServer, WebSocket } = require('ws');
const store = require('./store');

function setupWebSocket(server, app) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcast(payload) {
    const data = JSON.stringify(payload);
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(data);
    });
  }

  app.set('wsBroadcast', ({ event, data }) => broadcast({ event, data }));

  wss.on('connection', (ws) => {
    let currentUser = null;

    // connect hone par history + online users bhejo
    ws.send(JSON.stringify({ event: 'history', data: store.getAllMessages() }));
    ws.send(JSON.stringify({ event: 'online_users', data: { count: store.getOnlineCount(), users: store.getAllUsers() } }));

    ws.on('message', (raw) => {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        ws.send(JSON.stringify({ event: 'error', message: 'Invalid JSON' }));
        return;
      }

      const { event, data = {} } = parsed;

      switch (event) {

        // ── USER JOIN ──────────────────────────────────────
        case 'join': {
          const { name } = data;
          if (!name) { ws.send(JSON.stringify({ event: 'error', message: 'name required' })); break; }

          currentUser = store.addUser(ws._socket.remoteAddress + Date.now(), name);
          ws.userName = name;

          broadcast({ event: 'user_joined', data: { name, online_count: store.getOnlineCount() } });
          broadcast({ event: 'online_users', data: { count: store.getOnlineCount(), users: store.getAllUsers() } });
          break;
        }

        // ── SEND MESSAGE ───────────────────────────────────
        case 'send_message': {
          const { sender, message, message_type = 'text' } = data;
          if (!sender || !message) {
            ws.send(JSON.stringify({ event: 'error', message: 'sender and message required' }));
            break;
          }
          const newMsg = store.addMessage(sender, message, message_type);
          broadcast({ event: 'new_message', data: newMsg });
          break;
        }

        // ── EDIT MESSAGE ───────────────────────────────────
        case 'edit_message': {
          const { id, message } = data;
          if (!id || !message) { ws.send(JSON.stringify({ event: 'error', message: 'id and message required' })); break; }

          const updated = store.updateMessage(parseInt(id), message);
          if (!updated) { ws.send(JSON.stringify({ event: 'error', message: 'Message not found' })); break; }

          broadcast({ event: 'message_updated', data: updated });
          break;
        }

        // ── DELETE MESSAGE ─────────────────────────────────
        case 'delete_message': {
          const { id } = data;
          if (!id) { ws.send(JSON.stringify({ event: 'error', message: 'id required' })); break; }

          const deleted = store.deleteMessage(parseInt(id));
          if (!deleted) { ws.send(JSON.stringify({ event: 'error', message: 'Message not found' })); break; }

          broadcast({ event: 'message_deleted', data: { id: deleted.id } });
          break;
        }

        // ── TYPING START ───────────────────────────────────
        case 'typing_start': {
          const { sender } = data;
          if (!sender) break;
          store.addTyping(sender);
          broadcast({ event: 'typing', data: { sender, is_typing: true, typing_users: store.getAllTyping() } });
          break;
        }

        // ── TYPING STOP ────────────────────────────────────
        case 'typing_stop': {
          const { sender } = data;
          if (!sender) break;
          store.removeTyping(sender);
          broadcast({ event: 'typing', data: { sender, is_typing: false, typing_users: store.getAllTyping() } });
          break;
        }

        default:
          ws.send(JSON.stringify({ event: 'error', message: `Unknown event: ${event}` }));
      }
    });

    ws.on('close', () => {
      if (currentUser) {
        store.removeUser(currentUser.socketId);
        store.removeTyping(ws.userName);
        broadcast({ event: 'user_left', data: { name: ws.userName, online_count: store.getOnlineCount() } });
        broadcast({ event: 'online_users', data: { count: store.getOnlineCount(), users: store.getAllUsers() } });
      }
    });
  });

  console.log('WebSocket ready at ws://localhost:<PORT>/ws');
  return wss;
}

module.exports = setupWebSocket;
