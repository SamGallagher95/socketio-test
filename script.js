var socket = io("http://localhost:80");

// System info
const storeId = 123456;
const deviceId = 123456;

function main() {
  // Fire the connect event
  socket.emit("connected", {
    storeId: 123456,
    deviceId: 123456,
    clientTime: new Date().getTime()
  });
}

main();

// // Listen for a new title
// socket.on("newTitle", function(data) {
//   // Get the message
//   const message = data.text;

//   // Set the html
//   document.getElementById("title").innerHTML = message;
// });
