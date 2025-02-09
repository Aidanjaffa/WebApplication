import { Rect, loadImage, resizeCanvas } from "./helpers.js";

const canvas = document.querySelector("canvas");
const c = canvas.getContext('2d');

const socket = io('wss://followup-zp4v.onrender.com/game', {
    transports: ["websocket"], 
    rejectUnauthorized: false, 
  });
  
var background;
loadImage("../static/assets/Lv1_BG1.png", function(image){
    background = image;
    requestAnimationFrame(game);
})

var concrete;
loadImage("../static/assets/dirt.png", function(image){
    concrete = image;
    requestAnimationFrame(game);
})

resizeCanvas();

var players = {}
var id;
var map;
socket.on("mapData", (data) =>{
    console.log(data);
    map = data;
})

socket.on("sendID", (data) =>{
    id = data;
})

socket.on("playerUpdate", (data) => {
    players = {}
    for (let id in data) {
        players[id] = data[id];
    }
});

var movement = 0;
window.addEventListener("keydown", keypress);
window.addEventListener("keyup", keypress);
function keypress(event){
    if (event.type === "keydown"){
        switch (event.key){
            case "d":
                movement = 1;
                break;
            case "a":
                movement = -1;
                break;
            default:
                movement = 0;
        };
        players[id].pos[0] += movement;
    }
    if (event.type === "keyup"){
        switch (event.key){
            case "d":
                movement = 0;
                break;
            case "a":
                movement = 0;
                break;
            default:
                movement = 0;
        };
    }
    socket.emit("playerUpdate", { "player_data" : players[id], "movement" : movement});
}
 
function drawMap(){
    let y = 0;
    for (let row of map["tiles"]){
        let x = 0;
        for (let block of row){
            if (concrete && block === 1){
                c.drawImage(concrete, x * 50, y * 50, 50, 50)
            }
            x++;
        }
        y++;
    }
}

function game(){
    c.clearRect(0, 0, canvas.width, canvas.height);
    if (background) c.drawImage(background, 0, 0, canvas.width, canvas.height);     // background image
    if (map) drawMap(); // map drawing

    for (let i in players){
        let rect = new Rect(players[i].pos[0], players[i].pos[1], players[i].color);
        rect.draw();
    }
    requestAnimationFrame(game);
}

game()
