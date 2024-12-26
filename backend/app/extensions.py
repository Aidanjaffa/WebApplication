from flask_session import Session
from flask_socketio import SocketIO
from flask_cors import CORS

session = Session()
socket = SocketIO()
cors = CORS()