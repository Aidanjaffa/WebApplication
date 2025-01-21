from app import create_app
import eventlet
import os

app = create_app()

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    base_dir = os.path.dirname(os.path.abspath(__file__))

    cert_file = os.path.join(base_dir, "ssl/server.cert")
    key_file = os.path.join(base_dir, "ssl/server.key")

    print(os.path.exists(cert_file))
    print(os.path.exists(key_file)) 

    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', port)), app)