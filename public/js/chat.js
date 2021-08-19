//client side JS file to use script made by socket.io

//calling io() function to connect to the server
const socket = io();

//Elements
const $messageForm = document.querySelector("#message_form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages"); //location where the template will be rendered

//template (this will be rendered)
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { userName, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoScroll = () => {
	//New message element
	const $newMessage = $messages.lastElementChild;

	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = $messages.offsetHeight;

	// Height of messages container
	const containerHeight = $messages.scrollHeight;

	// How far have I scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight;
	const scrolledToTheBottomZone = 10;
	if (
		containerHeight - newMessageHeight <=
		scrollOffset + scrolledToTheBottomZone
	) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

//receive event
socket.on("message", (msg) => {
	const html = Mustache.render(messageTemplate, {
		userName: msg.userName,
		msg: msg.text,
		createdAt: moment(msg.createdAt).format("h:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

socket.on("locationMessage", (data) => {
	const html = Mustache.render(locationTemplate, {
		userName: data.userName,
		URL: data.url,
		createdAt: moment(data.createdAt).format("h:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

socket.on("roomData", ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	document.querySelector("#sidebar").innerHTML = html;
});

//for message form
$messageForm.addEventListener("submit", (e) => {
	e.preventDefault();

	$messageFormButton.setAttribute("disabled", "disabled");

	const message = e.target.elements.message.value;

	socket.emit("sendMessage", message, () => {
		$messageFormButton.removeAttribute("disabled");
		$messageFormInput.value = "";
		$messageFormInput.focus();

		console.log("Message delievered!");
	});
});

//for send location button
$sendLocationButton.addEventListener("click", (e) => {
	if (!navigator.geolocation) {
		return alert("Geolocation is not supported by your browser");
	}

	//disable
	$sendLocationButton.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			"sendLocation",
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
			() => {
				//enable
				$sendLocationButton.removeAttribute("disabled");
				console.log("Your Location has been Shared");
			}
		);
	});
});

socket.emit("join", { userName, room }, (error) => {
	if (error) {
		alert(error);
		location.href = "/";
	}
});
