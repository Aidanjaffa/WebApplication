from flask import Blueprint, request, jsonify
import app.email
import datetime

terminal_blueprint = Blueprint("terminal", __name__, url_prefix="/terminal")

# login xX11shadowman11Xx@gmail.com ydaj hvpl bjnw vmtc

@terminal_blueprint.route("/", methods=["GET", "POST"])
def api():
    if request.method == "POST":
        from app.email import loggedIn, login, email_thread, console_messages, send_list

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



