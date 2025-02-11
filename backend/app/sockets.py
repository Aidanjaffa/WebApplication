from flask_socketio import SocketIO, join_room, leave_room
from app.extensions import socket
from flask import request, redirect
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
    id = request.sid # gets browser id
    players[id] = Player(id) # sets it as player id
    map = Map().__dict__    # jsonifys the map object to be sent over sockets
    join_room(id)   # joins a room of its own player id 
    socket.emit("sendID", id, room=id, namespace="/game") # emits id data to the individual player in the room
    socket.emit("mapData", map, namespace="/game") # emits map data to all
    playerUpdate() # will update all players
    print(f"player connected id = {id}") # logs that the player joined 

@socket.on('playerUpdate', namespace="/game")
def playerUpdate(data={}):
    if "player_data" in data.keys(): # ensuring the correct json data before proceeding
        movement = data["movement"] 
        id = data["player_data"]["id"]
        print(movement)

        try:
            players[id].vel = movement
            players[id].update()
        except KeyError:
            print ("Player ID error! Attempting Reconnect")
            return redirect("https://localhost:5000/game")
        
    for p in players.keys(): # iterates through every player object in the dictionary
        players[p].update() # updates each player server side
    playerDict = {key: players[key].__dict__ for key in players.keys()} # updates the dictionary preparing it to be sent to the client
    socket.emit("playerUpdate", playerDict, namespace="/game") # emits the player data to the client

@socket.on('disconnect', namespace="/game")
def disconnect():
    players.pop(request.sid)
    print(request.sid, " disconnected")
    playerUpdate()


def moveUpdate(pos):
    pass