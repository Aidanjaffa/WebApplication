from eventlet import wsgi
import eventlet
from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', port)), app) 