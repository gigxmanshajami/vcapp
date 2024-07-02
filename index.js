const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv'); // Import dotenv

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const videoRoutes = require('./routes/videoRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port =  3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {  })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', async (msg) => {
        const { text, sender, roomId } = msg;

        if (!text || !sender || !roomId) {
            return;
        }

        try {
            const newMessage = new Message({ text, sender, roomId });
            await newMessage.save();
            io.to(roomId).emit('chat message', newMessage); 
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('join room', (roomId) => {
        socket.join(roomId);
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/video', videoRoutes); 

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
