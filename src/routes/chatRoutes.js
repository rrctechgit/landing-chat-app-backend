const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/messages
router.get('/messages', (req, res) => {
  res.json({ success: true, data: store.getAllMessages() });
});

// GET /api/messages/:id
router.get('/messages/:id', (req, res) => {
  const msg = store.getMessageById(parseInt(req.params.id));
  if (!msg) return res.status(404).json({ success: false, error: 'Message not found' });
  res.json({ success: true, data: msg });
});

// POST /api/messages
router.post('/messages', (req, res) => {
  const { sender, message, message_type = 'text' } = req.body;
  if (!sender || !message)
    return res.status(400).json({ success: false, error: 'sender and message are required' });

  const newMsg = store.addMessage(sender, message, message_type);
  req.app.get('wsBroadcast')?.({ event: 'new_message', data: newMsg });
  res.status(201).json({ success: true, data: newMsg });
});

// PUT /api/messages/:id
router.put('/messages/:id', (req, res) => {
  const { message } = req.body;
  if (!message)
    return res.status(400).json({ success: false, error: 'message is required' });

  const updated = store.updateMessage(parseInt(req.params.id), message);
  if (!updated) return res.status(404).json({ success: false, error: 'Message not found' });

  req.app.get('wsBroadcast')?.({ event: 'message_updated', data: updated });
  res.json({ success: true, data: updated });
});

// DELETE /api/messages/:id
router.delete('/messages/:id', (req, res) => {
  const deleted = store.deleteMessage(parseInt(req.params.id));
  if (!deleted) return res.status(404).json({ success: false, error: 'Message not found' });

  req.app.get('wsBroadcast')?.({ event: 'message_deleted', data: { id: deleted.id } });
  res.json({ success: true, message: 'Message deleted', id: deleted.id });
});

// GET /api/users  (online users)
router.get('/users', (req, res) => {
  res.json({ success: true, count: store.getOnlineCount(), data: store.getAllUsers() });
});

module.exports = router;
