const generateMessage = (userName, text) => {
	return {
		userName,
		text: text,
		createdAt: new Date().getTime(),
	};
};

const generateLocationMessage = (userName, locationURL) => {
	return {
		userName,
		url: locationURL,
		createdAt: new Date().getTime(),
	};
};

module.exports = {
	generateMessage,
	generateLocationMessage,
};
