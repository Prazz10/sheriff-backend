import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import sosRoutes from './routes/sos';
import locationRoutes from './routes/location';
import userRoutes from './routes/user';
import notifyRoutes from './routes/notify';

dotenv.config();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notify', notifyRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'SheRiff backend is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-trip', (tripId: string) => {
    socket.join(tripId);
    console.log('User joined trip room:', tripId);
  });

  socket.on('location-update', (data: {
    tripId: string;
    lat: number;
    lng: number;
    timestamp: string;
  }) => {
    socket.to(data.tripId).emit('location-received', data);
  });

  socket.on('join-sos', (userId: string) => {
    socket.join('sos-' + userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log('SheRiff backend running on port ' + PORT);
});
