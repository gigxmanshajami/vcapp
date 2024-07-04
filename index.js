const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('../doctorapp-backend/models/User');
const { v4: uuidv4 } = require('uuid'); // For generating unique room IDs

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret'; // Replace with your actual secret

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://ash2002:Hello123@cluster0.x8hjjjv.mongodb.net/doctorapp?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join room', ({ roomId }) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('leave room', ({ roomId }) => {
        socket.leave(roomId);
        console.log(`User left room: ${roomId}`);
    });

    socket.on('disconnect', async () => {
        console.log('user disconnected');
        // Here you can handle setting the user's status to offline if you store socket ID to user mapping
    });

    socket.on('chat message', async ({ roomId, msg }) => {
        const { text, sender } = msg;

        if (!text || !sender || !roomId) {
            return;
        }

        try {
            const newMessage = new Message({ text, sender, roomId });
            await newMessage.save();
            io.to(roomId).emit('chat message', newMessage); // Broadcast the new message to the specific room
        } catch (err) {
            console.error(err);
        }
    });
});

// Routes
app.get('/messages/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.find({ roomId }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/doctors', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).sort({ online: -1 });
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role, online: true });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        user.online = true;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/logout', async (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
            user.online = false;
            await user.save();
        }
        res.json({ message: 'User logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/create-room', (req, res) => {
    const { userId1, userId2 } = req.body;
    const roomId = uuidv4();
    console.log(roomId);
    // Optionally, save roomId to the database along with userId1 and userId2 for future reference.
    res.json({ roomId });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
