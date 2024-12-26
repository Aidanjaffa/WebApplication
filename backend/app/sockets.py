from flask_socketio import SocketIO, join_room, leave_room
from app.extensions import socket
from flask import request
from app.game import Player, Map
from json import JSONEncoder
@socket.on('connect', namespace="/terminal")
def connect():
    send("page load")
    print("connected")

@socket.on("send", namespace="/terminal")
def send(msg):
    socket.emit("send", msg)


players = {}
@socket.on('connect', namespace="/game")
def connect():
    id = request.sid
    players[id] = Player(id)
    map = Map().__dict__
    join_room(id)
    socket.emit("sendID", id, room=id, namespace="/game")
    socket.emit("mapData", map, namespace="/game")
    playerUpdate()
    print(f"player connected id = {id}")

@socket.on('playerUpdate', namespace="/game")
def playerUpdate(data={}):
    if "player_data" in data.keys():
        print(data["player_data"]["id"])
    for p in players.keys():
        players[p].update()
    playerDict = {key: players[key].__dict__ for key in players.keys()}
    socket.emit("playerUpdate", playerDict, namespace="/game")

@socket.on('disconnect', namespace="/game")
def disconnect():
    players.pop(request.sid)
    print(request.sid, " disconnected")
    playerUpdate()


def moveUpdate(pos):
    pass