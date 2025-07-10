// app.js: Backend with express-fileupload for image notifications
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { Server } = require('socket.io');
const dayjs = require('dayjs');
const path = require('path');
const fs = require('fs');

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Enable file uploads
app.use(fileUpload({ createParentPath: true }));

// Serve static files from 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



mongoose.connect('mongodb://localhost:27017/college_transport', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Bus Model
const BusSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  route: String,
  stops: [String],
  startTime: String,
  driver: String,
  contact: String,
  capacity: String,
});
const Bus = mongoose.model('Bus', BusSchema);

// Notification Model
const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  imageUrl: String,
  sender: { type: String, required: true },
  type: { type: String, default: 'info' },
  time: { type: Date, default: Date.now },
});
const Notification = mongoose.model('Notification', NotificationSchema);



const InchargeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true}
});
const Incharge = mongoose.model('Incharge', InchargeSchema);



app.post('/api/incharge/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received credentials:', email, password);

  const user = await Incharge.findOne({ email });
  console.log('User found:', user);

  if (!user || user.password !== password) {
    console.log('Login failed due to mismatch');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  console.log('Login success');
  res.json({ success: true });
});



app.get('/api/buses', async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? { $or: [{ id: new RegExp(q, 'i') }, { route: new RegExp(q, 'i') }] }
    : {};
  const buses = await Bus.find(filter);
  res.json(buses);
});

app.get('/api/buses/:id', async (req, res) => {
  const bus = await Bus.findOne({ id: req.params.id });
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json(bus);
});

app.post('/api/driver/login', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ error: 'mobile required' });

  const bus = await Bus.findOne({ contact: mobile });
  if (!bus) return res.status(404).json({ error: 'No route for this driver' });

  bus.startTime = dayjs().format('HH:mm');
  await bus.save();
  res.json(bus);
});

app.get('/api/notifications', async (req, res) => {
  const all = await Notification.find().sort({ time: -1 });
  res.json(all);
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { title, message, sender, type } = req.body;
    let imageUrl;

    // If an image file is uploaded
    if (req.files && req.files.image) {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
      const imageFile = req.files.image;
      const filename = `${Date.now()}-${imageFile.name}`;
      await imageFile.mv(path.join(uploadDir, filename));
      imageUrl = `/uploads/${filename}`;
    }

    const notif = await Notification.create({ title, message, imageUrl, sender, type });
    io.emit('studentNotification', notif);
    res.json({ success: true, notif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Server + Socket.IO Setup
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const trackers = {};
const INTERVAL_MS = 60 * 1000;

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('sendNotification', async (data, callback) => {
    const notif = await Notification.create(data);
    io.emit('studentNotification', notif);
    callback({ success: true });
  });

  socket.on('startTracking', async ({ mobile, busId }) => {
    const bus = mobile
      ? await Bus.findOne({ contact: mobile })
      : await Bus.findOne({ id: busId });
    if (!bus) return socket.emit('trackingError', { message: 'No route' });

    const [h, m] = bus.startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    let idx = Math.floor((Date.now() - start.getTime()) / INTERVAL_MS);
    idx = Math.max(0, Math.min(idx, bus.stops.length - 1));

    socket.emit('locationUpdate', { idx });

    if (trackers[socket.id]) clearInterval(trackers[socket.id].timer);
    const timer = setInterval(() => {
      idx++;
      if (idx >= bus.stops.length) return clearInterval(timer);
      socket.emit('locationUpdate', { idx });
    }, INTERVAL_MS);

    trackers[socket.id] = { timer };
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (trackers[socket.id]) clearInterval(trackers[socket.id].timer);
    delete trackers[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
