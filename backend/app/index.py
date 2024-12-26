from flask import Blueprint, send_from_directory
import os

react_blueprint = Blueprint("react", __name__, url_prefix="/")

@react_blueprint.route("/", defaults={"path": ""})
@react_blueprint.route("/<path:path>")
def reactApp(path):
    react = "../build"
    if path != "" and os.path.exists(os.path.join(react, path)):
        return send_from_directory(react, path)
    else:
        print("index")
        return send_from_directory(react, "index.html")