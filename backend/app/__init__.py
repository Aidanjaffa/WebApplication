from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix
from .extensions import session, CORS, socket
from app.terminal import terminal_blueprint
from app.game import game_blueprint
from app.index import react_blueprint
import signal

def create_app():
    app = Flask(__name__, template_folder="../templates")
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
    app.config.from_object("config.Config")
    app.config.from_object("config")

    session.init_app(app)
    CORS(app, resources={r"/*": {"origins": "*"}})
    socket.init_app(app, cors_allowed_origins="*")

    app.register_blueprint(terminal_blueprint)
    app.register_blueprint(game_blueprint)
    app.register_blueprint(react_blueprint)

    signal.signal(signal.SIGINT, lambda sig, frame: shutdown())
 
    return app

def shutdown():
    print("\nShutting down Flask application...")
    exit(0)
