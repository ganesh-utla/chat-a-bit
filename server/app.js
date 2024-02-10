const express = require('express');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

require('./db/connection');
const Users = require('./modules/Users');
const Conversations = require('./modules/Conversations');
const Messages = require('./modules/Messages');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: `${process.env.CLIENT_ORIGIN}`
    }
});
const port = process.env.PORT || 5000;

const allowedUrls = ["http://localhost:5173"];
const corsOptions = {
  origin: (origin, callback) => {
    if (origin===undefined || allowedUrls.indexOf(origin) !== -1) {
    callback(null, true)
    } else {
    callback(new Error())
    }
  },
  credentials: true
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));

// SocketIO Implementation
let users = [];
io.on('connection', socket => {
    socket.on('addUser', userId => {
        const isUserExists = users.find(user => user.id===userId);
        if (!isUserExists) {
            const user = { id: userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, conversationId, message }) => {
        const receiver = users.find(user => user.id === receiverId);
        const sender = users.find(user => user.id === senderId);
        const user = await Users.findById(senderId);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user : { id: user._id, fullname: user.fullname, email: user.email }
            });
        } else {
            io.to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user : { id: user._id, fullname: user.fullname, email: user.email }
            });
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId!==socket.id);
        io.emit('getUsers', users);
    });
});


app.get('/', (req, res) => {
    res.send("Hello");
})

app.post('/api/register', async (req, res, next) => {
    try {
        const { fullname, email, password } = req.body;
        const userAlreadyExists = await Users.findOne({ email: email });
        if (userAlreadyExists) {
            res.status(400).send("User already exists!!");
        } else {
            const newUser = new Users({ fullname, email });
            bcryptjs.hash(password, 10, (err, hashedPswd) => {
                newUser.set('password', hashedPswd);
                newUser.save();
                next();
            });
            res.status(200).send("User registered successfully!!");
        }
    } catch (error) {
        console.log(error);
    }
});


app.post('/api/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ email });
        
        if (!user) {
            res.status(400).send("User not found!!");
        } else {
            const validateUser = await bcryptjs.compare(password, user.password);
            if (!validateUser) {
                res.status(400).send("Incorrect password");
            } else {
                const payload = {
                    userId: user._id,
                    email: user.email
                }
                const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "THIS_IS_A_JWT_SECRET_KEY";

                jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
                    await Users.updateOne({ _id: user._id }, {
                        $set: { token }
                    });
                    user.save();
                    res.status(200).json({ 
                        user: { id: user._id, fullname: user.fullname, email: user.email }, 
                        token: token 
                    });
                });
            }
        }
        
    } catch (error) {
        console.log(error);
    }
});


app.post('/api/conversation', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newConversation = new Conversations({ members: [senderId, receiverId] });
        await newConversation.save();
        res.status(200).send('Conversation created successfully!!');
    } catch (error) {
        console.log(error);
    }
});


app.get('/api/conversations/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversations.find({ members: { $in: [userId] } });
        const conversationUserData = Promise.all(conversations.map(async (conv) => {
            const receiverId = conv.members.find((member) => member !== userId);
            const user = await Users.findById(receiverId);
            return { user: { id: user._id, email: user.email, fullname: user.fullname }, conversationId: conv._id };
        }));
        const data = await conversationUserData;
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
    }
});


app.post('/api/message', async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId } = req.body;
        if (!message || !senderId) {
            return res.send(400).send('Please fill all required fields!!');
        }
        if (conversationId==='new') {
            if (receiverId) {
                const newConversation = new Conversations({ members: [senderId, receiverId] });
                await newConversation.save();
                const newMessage = new Messages({ conversationId: newConversation._id, senderId, message });
                await newMessage.save();
                return res.status(200).send("Message created successfully!!");
            } else {
                return res.status(400).send("Receiver id didn't mentioned!!");
            }
        } else {
            const newMessage = new Messages({ conversationId, senderId, message });
            await newMessage.save();
            return res.status(200).send("Message created successfully!!");
        }
    } catch (error) {
        console.log(error);
    }
});


app.get('/api/messages/:conversationId', async (req, res) => {
    try {
        const checkMessages = async (conversationId) => {
            const messages = await Messages.find({ conversationId });
            const messagesData = Promise.all(messages.map(async (mes) => {
                const user = await Users.findById(mes.senderId);
                return { user: { id: user._id, email: user.email, fullname: user.fullname }, message: mes.message };
            }));
            const data = await messagesData;
            return data;
        }

        const conversationId = req.params.conversationId;
        if (conversationId==='new') {
            const checkConversation = await Conversations.find({ members: {$all: [req.query.receiverId, req.query.senderId]}});
            if (checkConversation.length > 0) {
                const messages = await checkMessages(checkConversation[0]._id);
                return res.status(200).json(messages);
            }
            return res.status(200).json([]);
        } else {
            const messages = await checkMessages(conversationId);
            return res.status(200).json(messages);
        }
    } catch (error) {
        console.log(error);
    }
});


app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const users = await Users.find({ _id: { $ne: userId } });
        const userData = Promise.all(users.map(user => {
            return { id: user._id, fullname: user.fullname, email: user.email }
        }))
        res.status(200).json(await userData); 
    } catch (error) {
        console.log(error);
    }
})


server.listen(port, () => {
    console.log("Listening on port " + port);
});
