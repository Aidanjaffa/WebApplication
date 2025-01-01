from flask import Flask, redirect, render_template, session, request, jsonify, Blueprint
from flask_session import Session
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO
import smtplib
import datetime, time
from email.mime.text import MIMEText
import threading
import signal

stop_thread = False
send_list = [["awfegshdh", "fsadgsf"]]
console_messages = []

message = "Hi My name is aidan, i made an application with you, i just wanted to follow up on my application and see how everything is going"

loggedIn = False
sender = ""
lock = threading.Lock()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5000/game"])
socket = SocketIO(app, cors_allowed_origins="*")

app.config["SESSION_PERMANENT"] = False  # Session will be cleared when user closes their browser
app.config["SESSION_TYPE"] = "filesystem"  # Session data will be stored on the file system
app.config["SECRET_KEY"] = "test"
app.config["UPLOAD_FOLDER"] = "static/files"
Session(app)
server = smtplib.SMTP_SSL("smtp.gmail.com", 465)

game_blueprint = Blueprint('game', __name__, url_prefix='/game')
terminal_blueprint = Blueprint('terminal', __name__, url_prefix='/terminal')

def login(name, password):
    global server, loggedIn, sender
    try:
        send("login")
        server.login(name, password)
        console_messages.append("Logged In")
        loggedIn = True
        sender = name
        return True
    except smtplib.SMTPAuthenticationError:
        send("Auth Error")
        console_messages.append("Authentication Error. Have you enabled app passwords on gmail?")
        return False

def email():
    global stop_thread, server
    while not stop_thread:
        with lock:
            for data in send_list:
                msg = MIMEText(message)
                msg["subject"] = "Application follow up"
                date = data[1]
                current = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
                #print(f"waiting to send to {data[0]} at time {date}. Current Time: {current} ")

                if int(date) < int(current):
                    server.sendmail(sender, data[0], msg.as_string())
                    send_list.remove(data)
                    send(f"\nSent to {data[0]}")
                    console_messages.append(f"\nSent to {data[0]}")
        time.sleep(1)
email_thread = threading.Thread(target=email)

def signal_handler(sig, frame):
    global stop_thread
    print("\nShutting down Flask application...")
    stop_thread = True
    email_thread.join()
    exit(0)


signal.signal(signal.SIGINT, signal_handler)


@socket.on('connect', namespace="/terminal")
def connect():
    send("page load")
    print("connected")


    print("Player Connected!")

@socket.on("send", namespace="/terminal")
def send(msg):
    socket.emit("send", msg)

players = []
@socket.on('connect', namespace="/game")
def connect():
    players.append(request.sid)
    print(f"player connected id = {request.sid}")
    assign(request.sid)

@socket.on('assignID', namespace="/game")
def assign(id):
    socket.emit("assignID", id, namespace="/game")


# default route wouldnt handle api request so i made a different route
@app.route("/")
def index():
    return jsonify({
        "userid" : 4,
        "title" : "flask react application",
        "completed" : False
    })


@app.route("/terminal", methods=["GET", "POST"])
def api():
    global message
    if request.method == "POST":
        # getting json
        data = request.json
        commands = data.split(" ")
        print("commands", commands)
        if not loggedIn and commands[0] == "login":
                try:
                    name = commands[1]
                    password = " ".join(commands[2:])
                    if login(name, password):
                        email_thread.start()
                except IndexError:
                    console_messages.append("Missing args")
        elif loggedIn:
            match commands[0]:
                case "new":
                    try:
                        sendDate = commands[1]
                        send_list.append([commands[2], sendDate])
                        console_messages.append ("New email to " + commands[2] + " at time " + sendDate)
                    except IndexError:
                        console_messages.append("not enough args")
                        pass

                case "status":
                    if send_list:
                        for item in send_list:
                            console_messages.append(f"Pending Delivery To {item[0]}, Delivery Time: {item[1]}, Current Time: {str(datetime.datetime.now().strftime('%H:%M:%S %d/%m/%Y'))}")
                    else:
                        console_messages.append("No Pending Tasks") 

                case "delete":
                    try:
                        deleted = int(commands[1])
                        del send_list[deleted]
                        console_messages.append("deleted")
                    except IndexError:
                        console_messages.append("data does not exist or you have not specified a target\n")
                        pass

                case "clear":
                    console_messages.clear()
                    console_messages.append("Messages Cleared!")

                case "time":
                    console_messages.append(str(datetime.datetime.now().strftime("%H:%M:%S %d/%m/%Y")))
                
                case "new_msg":
                    try:
                        message = " ".join(commands[1:])
                        console_messages.append("message updated")
                    except IndexError:
                        console_messages.append("No message included")
                
                case "help":
                    console_messages.append("new date in YMDHMS recipient")
                    console_messages.append("status")
                    console_messages.append("delete index")

                case _:
                    console_messages.append("Unknown command")
        else:
            console_messages.append("Login first to access CLI")

    return jsonify({
        "message": console_messages
    })


@app.route("/game", methods=["GET", "POST"])
def game():
    return render_template("game.html")



