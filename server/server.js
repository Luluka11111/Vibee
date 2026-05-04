const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'soulmate_secret_2026';

// Подключение к MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/moods_db')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ DB Error:', err));

// Модели данных
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
}));

const Entry = mongoose.model('Entry', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  mood: String,
  note: String,
  date: String // Сохраняем дату в формате YYYY-MM-DD
}));

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashed });
    await user.save();
    res.status(201).json({ message: 'OK' });
  } catch (e) { res.status(400).json({ error: 'Имя уже занято' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, username: user.username });
  } else { res.status(401).json({ error: 'Неверные данные' }); }
});

// --- Middleware для защиты маршрутов ---
const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send('No token');
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send('Invalid');
    req.userId = decoded.userId;
    next();
  });
};

// --- ENTRIES ---
app.get('/api/entries', checkAuth, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId });
  res.json(entries);
});

app.post('/api/entries', checkAuth, async (req, res) => {
  const { mood, note, date } = req.body;
  // Если запись на эту дату уже есть — обновляем, если нет — создаем
  const updated = await Entry.findOneAndUpdate(
    { userId: req.userId, date },
    { mood, note },
    { upsert: true, new: true }
  );
  res.json(updated);
});

app.listen(5000, () => console.log('🚀 Server started on port 5000'));