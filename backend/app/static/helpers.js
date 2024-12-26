const canvas = document.querySelector("canvas");
const c = canvas.getContext('2d');

export class Rect {
    constructor(x, y, colour) {
        this.originalX = x;
        this.originalY = y;
        this.width = 20;
        this.height = 20;
        this.color = colour;
    }
    draw() { 
        c.fillStyle = this.color;
        c.fillRect(this.originalX, this.originalY, this.width, this.height);
    }
}  

export function loadImage(img, callback){
    let image = new Image();
    image.src = img
    image.onload = function(){
         callback(image);
    }
}

export function resizeCanvas() {
    const viewportHeight = window.innerHeight;
    const viewportWidth = Math.max(window.innerWidth - 15, 400);
    const canvasHeight = Math.max(viewportHeight - 20, 500);

    canvas.height = canvasHeight;
    canvas.width = viewportWidth;
}