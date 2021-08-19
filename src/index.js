const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io"); //gives a function
const {
	generateMessage,
	generateLocationMessage,
} = require("./utils/messages");
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require("./utils/users");

//create express application
const app = express();

//create http server using express app
const server = http.createServer(app);

// Connect socket.io to the HTTP server
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

// Listen for new connections to Socket.io
io.on("connection", (socket) => {
	console.log("New websocket connection");

	socket.on("join", (options, callback) => {
		const { error, user } = addUser({ id: socket.id, ...options });

		if (error) {
			return callback(error);
		}
		socket.join(user.room);

		socket.emit("message", generateMessage("Admin", "Welcome!"));
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				generateMessage("Admin", `${user.userName} has joined!`)
			);
		io.to(user.room).emit("roomData", {
			room: user.room,
			users: getUsersInRoom(user.room),
		});
		callback(); //w/o args => no error
	});

	socket.on("sendMessage", (message, callback) => {
		const user = getUser(socket.id);

		io.to(user.room).emit("message", generateMessage(user.userName, message));
		callback();
	});

	socket.on("sendLocation", (coords, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			"locationMessage",
			generateLocationMessage(
				user.userName,
				`https://google.com/maps?q=${coords.latitude},${coords.longitude}`
			)
		);
		callback();
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit(
				"message",
				generateMessage("Admin", `${user.userName} left!`)
			);
			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

server.listen(port, () => {
	console.log("Server is up on port " + port);
});
