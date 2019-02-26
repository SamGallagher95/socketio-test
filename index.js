var app = require("http").createServer(handler);
var io = require("socket.io")(app);
var fs = require("fs");

var EventEmitter = require("./modules/eventEmitter");

app.listen(80);

function handler(req, res) {
  fs.readFile(__dirname + "/index.html", function(err, data) {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading index.html");
    }

    res.writeHead(200);
    res.end(`{ "test":"test" }`);
  });
}

// Keep a list of all devices
const devices = [];
let getChainProductDataRunning = false;

io.on("connection", function(socket) {
  // Listen for initial connection event
  socket.on("connected", function(data) {
    socket.broadcast.emit("newConnection", data);
    if (devices.find(d => d.deviceId === data.deviceId)) {
      // This device already exists
      console.log("Device exists already");
    } else {
      // New device, push to array
      devices.push(new Device(socket.id, data.deviceId, data.storeId, socket));
      console.log("new device pushed");
      console.log(devices.map(d => d.deviceId));
    }
  });
});

setTimeout(() => {
  getChainProductData();
}, 10000);

function getChainProductData() {
  // Set the state
  getChainProductDataRunning = true;

  console.log("I have this many devices", devices.length);

  const urls = [
    "https://jsonplaceholder.typicode.com/todos/1",
    "https://jsonplaceholder.typicode.com/todos/2",
    "https://jsonplaceholder.typicode.com/todos/3",
    "https://jsonplaceholder.typicode.com/todos/4"
  ];
  let urlIndex = 0;
  const output = [];
  let alreadyExclaimed = false;

  // Kick off each device with on url
  devices.forEach(device => {
    device.on("taskComplete", task => {
      console.log("this url: ", task.url);
      console.log("Got JSON data", task.data);
      output.push(task.data);
    });
    device.on("ready", () => {
      if (urlIndex < urls.length) {
        device.startRequest(urls[urlIndex]);
        ++urlIndex;
      } else if (output.length === urls.length && !alreadyExclaimed) {
        console.log("Got them all!");
        console.log(output);
        alreadyExclaimed = true;
      }
    });

    device.on("waiting", () => {});

    device.on("error", () => {});

    device.startRequest(urls[urlIndex]);
    ++urlIndex;
  });
}

class Device extends EventEmitter {
  constructor(socketId, deviceId, storeId, socket) {
    super();
    this.socketId = socketId;
    this.deviceId = deviceId;
    this.storeId = storeId;
    this.socket = socket;

    // Events
    this.socket.on("taskComplete", data => {
      this.emit("taskComplete", data);
      this.emit("ready");
    });

    // State
    this.isAvailable = true;
    this.isWorking = false;
    this.isWaiting = false;
  }

  startRequest(url) {
    console.log("Starting request", url);
    this.isAvailable = false;
    this.isWorking = true;

    this.socket.emit("task", { id: this.deviceId, url: url });
  }
}
