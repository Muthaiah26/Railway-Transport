const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dayjs = require('dayjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const BusSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true },
  route:       String,
  stops:       [String],
  startTime:   String,
  driver:      String,
  contact:     String,
  capacity:    String
});
const Bus = mongoose.model('Bus', BusSchema);


app.get('/api/buses', async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? { $or: [{ id: new RegExp(q,'i') }, { route: new RegExp(q,'i') }] }
    : {};
  const buses = await Bus.find(filter);
  res.json(buses);
});


app.post('/api/driver/login', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ error: 'mobile required' });

  const bus = await Bus.findOne({ contact: mobile });
  if (!bus) return res.status(404).json({ error: 'No route for this driver' });

  
  const now = dayjs().format('HH:mm');
  bus.startTime = now;
  await bus.save();

  res.json(bus);
});


app.get('/api/buses/:id', async (req, res) => {
  const bus = await Bus.findOne({ id: req.params.id });
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json(bus);
});

const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });


const trackers = {};
const INTERVAL_MS = 1 * 60 * 1000;

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

 socket.on('startTracking', async ({ mobile, busId }) => {
    const bus = mobile
    ? await Bus.findOne({ contact: mobile })
    : await Bus.findOne({ id: busId });
  
  if (!bus) return socket.emit('trackingError',{ message:'No route' });

  
  const [h,m] = bus.startTime.split(':').map(Number);
  const start = new Date(); start.setHours(h,m,0,0);
  let idx = Math.floor((Date.now() - start.getTime())/INTERVAL_MS);
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
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
