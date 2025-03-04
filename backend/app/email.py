import threading
import smtplib
from app.sockets import send
from email.mime.text import MIMEText
import datetime
import time

stop_thread = False
send_list = []
console_messages = []
message = "Test Message"

loggedIn = False 
sender = ""
lock = threading.Lock()
server = smtplib.SMTP_SSL("smtp.gmail.com", 465)

def login(name, password): 
    global server, loggedIn, sender
    print("login attempt")
    try:
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
                msg["subject"] = "Test"
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
