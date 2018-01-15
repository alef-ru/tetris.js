WIDTH = 20;
HEIGHT = 30;
CUBE_SIDE = 20;
var speed = 2; 
var x,y;
var f;

FIGURES = [ //Any figure consists of 4 points.
    //The central point always has a coordinates [0,0], so I list only the rest 3 points. 
    [[0, -1],   [0, 1],  [0, 2]], // This is a stick
    [[-1, -1],  [0, -1], [1, 0]], //
    [[1, -1],   [0, -1], [-1, 0]],
    [[-1, 0],   [0, -1], [1, 0]],
    [[-2, 0],   [-1, 0], [0, -1]],
    [[0, -1],   [1, 0],  [2, 0]],
    [[-1, -1],  [0, -1], [-1, 0]]
]

window.onload = function(){
    canv = document.getElementById("tetris-field");
    canv.width = WIDTH * CUBE_SIDE;
    canv.height = HEIGHT * CUBE_SIDE;
    ctx = canv.getContext("2d");

    field = new Array(WIDTH);
    for (i = 0; i < WIDTH;i++)
        field[i] = new Array(HEIGHT)

    document.addEventListener("keydown", keyPush);
    newFigure();
    gameTimer = setInterval(game, 1000 / speed)
    refreshTimer = setInterval(refresh, 1000 / 30)
    

}

function keyPush(evt){
    switch (evt.keyCode) {
        case 37:
            moveLeft()
            break;
        case 39:
            moveRight()
            break;
        case 40:
            moveDown()
            break;  
        case 32:
            rotate()
            break;  
        default:
            console.log("Key pressed, key code: " + evt.keyCode);
    }
}

// 90 degree, clockwise
function rotate(){
    console.log("rotate");

    // FixMe: rotating square around any of it points looks like just shifting.

    var g = new Array(f.length)
    for (var i = 0; i < f.length; i++)
        g[i] = [-f[i][1], f[i][0]];
    if (!isOverlappedOrOutOfField(0, 0, g))
        f = g
}

function refresh(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    
    ctx.fillStyle = "lime";
    f.concat([[0, 0]]).forEach(function(i, index){
        ctx.fillRect((x + i[0]) * CUBE_SIDE, (y + i[1]) * CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
        ctx.strokeRect((x + i[0]) * CUBE_SIDE, (y + i[1]) * CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
    });

    ctx.fillStyle = "green";
    for (var xx = 0; xx < WIDTH; xx++)
        for (var yy = 0; yy < HEIGHT; yy++)
            if (field[xx][yy]){
                ctx.fillRect(xx * CUBE_SIDE, yy * CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
                ctx.strokeRect(xx * CUBE_SIDE, yy * CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
            }
}

function game(){
    if (isOverlappedOrOutOfField(0,1,f))
        if (y==1) gameOver();
        else endOfTurn();
    else
        y++;
}

function moveLeft() {
    console.log("moveLeft");
    if (!isOverlappedOrOutOfField(-1, 0, f))
        x--;
 }

function moveRight() {
    if (!isOverlappedOrOutOfField(1, 0, f)) 
        x++;
    console.log("moveRight");
}

function isOverlappedOrOutOfField(xShift, yShift, f){
    var result = false;
    f.concat([[0, 0]]).forEach(function(i, index){
        var newX = x + i[0] + xShift;
        var newY = y + i[1] + yShift;

        // Check if out of field first
        if (newX < 0 || newY < 0 || newX >= WIDTH || newY >= HEIGHT)
            result = true
        else if (field[newX][newY])
            result = true
    });
    return result;
}

function moveDown() {
    console.log("moveDown");
    game();
}

function gameOver(){
    clearInterval(gameTimer);
    clearInterval(refreshTimer);
    refresh();
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.fillText("Game Over", canv.width / 2, canv.height / 2);
}

function pause(){
    clearInterval(gameTimer);
    clearInterval(refreshTimer);
    document.getElementById("pause").value = "Resume";
    document.getElementById("pause").onclick = resume
}

function resume() {
    gameTimer = setInterval(game, 1000 / speed)
    refreshTimer = setInterval(refresh, 1000 / 30)
    document.getElementById("pause").value = "Pause";
    document.getElementById("pause").onclick = pause
}

function endOfTurn(){
    field[x][y] = 1;
    f.forEach(function (i, index) {
        field[(x + i[0])][(y + i[1])] = 1;
    });

    newFigure();

    // Check if any row is complete
    rowLoop:
    for (var yy = HEIGHT-1; yy > 0; yy--){
        for (var xx = 0; xx < WIDTH; xx++)
            if (!field[xx][yy]) 
                continue rowLoop;
        // following code removes a complete row
        for (var yyy = yy; yyy > 0; yyy--)
            for (var xx = 0; xx < WIDTH; xx++)
                field[xx][yyy] = field[xx][yyy-1];
        yy++; // Current row is replaced, so it should be checked again
        document.getElementById("score").innerHTML++;
        speed = Math.floor(document.getElementById("score").innerHTML / 5 + GAME_SPEED);
        document.getElementById("speed").innerHTML = speed;
        clearInterval(gameTimer)
        gameTimer = setInterval(game, 1000 / speed)

    }
    

}

function newFigure(){
    y = 1; x = WIDTH / 2;
    f = FIGURES[Math.floor(Math.random() * FIGURES.length)]
}