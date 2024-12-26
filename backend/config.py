import os

class Config:
    SESSION_PERMANENT = False
    SESSION_TYPE = "filesystem"
    SECRET_KEY = "test"
    UPLOAD_FOLDER = "static/files"
