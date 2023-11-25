const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const rootRouter = require('./routers');
const cookieParser = require('cookie-parser');
const { checkAuth, checkAuthAPI } = require('./authenticate/authentication');
const {getUserByRoom, outRoom} = require('./controllers/users.controller');
app.use(express.json());
const staticPath = path.join(__dirname, 'public');
app.use("/public", express.static(staticPath));

app.use('/api', rootRouter);
app.use(cookieParser());
app.get('/', checkAuth, (req, res) => {
    res.redirect('/public/clients/dist/profile.html');
});
app.get("/api/authentication", checkAuthAPI);

app.use(function (err, req, res, next) {
    if (err) {
        res.status(400).json({ error: err.message });
    } else {
        next();
    }
});

io.on('connection', (socket) => {
    socket.on('join-room', ({ idRoom }) => {
        socket.join(idRoom);
        io.to(idRoom).emit("new-user-join");
        socket.on('disconnect', async () => {
            await outRoom(socket.idUser);
            const allUsersInRoom = await getUserByRoom(idRoom);
            socket.broadcast.to(idRoom).emit('user_disconnect', allUsersInRoom);
        });
        socket.on('send-message', (data) => {
            io.to(idRoom).emit('send-message', data);
        });
    
        socket.on("send-location", ({ lat, lng, infoUser }) => {
            io.to(idRoom).emit("send-location", { lat, lng, infoUser });
        });
        socket.on("set-socketId", ({idUser}) => {
            socket.idUser = idUser;
        })
        socket.on("get-all-user-in-room", async () => {
            const allUsersInRoom = await getUserByRoom(idRoom);
            io.to(idRoom).emit("allMember", allUsersInRoom);
        });
    });
});

const {MONGO_URL} = process.env;

mongoose.connect(MONGO_URL)
  .then(() => console.log('Connect to mongoDB successfully'))
  .catch(err => console.error('Could not connect to MongoDB', err));

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});