const messages = [];
const users = [];
const typing = [];
let nextId = 1;

const store = {
  // ── MESSAGES ──────────────────────────────────────────
  getAllMessages() {
    return messages.filter((m) => !m.is_deleted);
  },

  getMessageById(id) {
    return messages.find((m) => m.id === id && !m.is_deleted) || null;
  },

  addMessage(sender, message, message_type = 'text') {
    const msg = {
      id: nextId++,
      sender,
      message,
      message_type,
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    messages.push(msg);
    return msg;
  },

  updateMessage(id, newMessage) {
    const msg = messages.find((m) => m.id === id && !m.is_deleted);
    if (!msg) return null;
    msg.message = newMessage;
    msg.is_edited = true;
    msg.updated_at = new Date().toISOString();
    return msg;
  },

  deleteMessage(id) {
    const msg = messages.find((m) => m.id === id && !m.is_deleted);
    if (!msg) return null;
    msg.is_deleted = true;
    msg.updated_at = new Date().toISOString();
    return msg;
  },

  // ── USERS ─────────────────────────────────────────────
  getAllUsers() {
    return users;
  },

  addUser(socketId, name) {
    const existing = users.find((u) => u.socketId === socketId);
    if (existing) return existing;
    const user = {
      socketId,
      name,
      joined_at: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },

  removeUser(socketId) {
    const index = users.findIndex((u) => u.socketId === socketId);
    if (index === -1) return null;
    const [removed] = users.splice(index, 1);
    return removed;
  },

  getOnlineCount() {
    return users.length;
  },

  // ── TYPING ────────────────────────────────────────────
  getAllTyping() {
    return typing;
  },

  addTyping(sender) {
    if (!typing.find((t) => t.sender === sender)) {
      typing.push({ sender, started_at: new Date().toISOString() });
    }
  },

  removeTyping(sender) {
    const index = typing.findIndex((t) => t.sender === sender);
    if (index !== -1) typing.splice(index, 1);
  },
};

module.exports = store;
