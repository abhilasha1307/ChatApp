const users = [];

//addUser => to track new user
//removeUser => stop tracking a user
//getUser => fetch data for existing user
//getUsersInRoom => list of users in one room

const addUser = ({ id, userName, room }) => {
	//clean the data
	userName = userName.trim().toLowerCase();
	room = room.trim().toLowerCase();

	//Validate the data
	if (!userName || !room) {
		return {
			error: "Username and room are required!",
		};
	}

	//Check for existing user
	const existingUser = users.find((user) => {
		return user.room === room && user.userName === userName;
	});

	//Validate userName
	if (existingUser) {
		return {
			error: "Username is in use!",
		};
	}

	// Store User

	const user = { id, userName, room };
	users.push(user);
	return { user };
};

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);

	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

const getUser = (id) => {
	const user = users.find((user) => {
		return user.id === id;
	});

	return user;
};

const getUsersInRoom = (room) => {
	const usersInRoom = users.filter((user) => {
		return user.room === room;
	});

	return usersInRoom;
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
};
