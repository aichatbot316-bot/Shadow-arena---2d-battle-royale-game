const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
cors: {
origin: "*"
}
});

app.use(express.static(__dirname));

const players = {};

function createPlayer(id) {
return {
id,
x: 150 + Math.random() * 500,
y: 150 + Math.random() * 300,
color: "#" + Math.floor(Math.random() * 16777215)
.toString(16)
.padStart(6, "0"),
name: "Player",
health: 100
};
}

io.on("connection", (socket) => {
console.log("Player connected:", socket.id);

players[socket.id] = createPlayer(socket.id);

socket.emit("currentPlayers", players);
socket.broadcast.emit("newPlayer", players[socket.id]);

socket.on("move", (data) => {
const player = players[socket.id];
if (!player || !data) return;

const dx = Number(data.dx);
const dy = Number(data.dy);

if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return;

player.x = Math.max(20, Math.min(780, player.x + dx * 5));
player.y = Math.max(20, Math.min(580, player.y + dy * 5));

socket.broadcast.emit("playerMoved", {
  id: socket.id,
  x: player.x,
  y: player.y
});

});

socket.on("disconnect", () => {
delete players[socket.id];
io.emit("playerDisconnected", socket.id);
console.log("Player disconnected:", socket.id);
});
});

app.get("/health", (req, res) => {
res.json({ status: "ok", players: Object.keys(players).length });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
console.log("SHADOW ARENA server running on port ${PORT}");
});
