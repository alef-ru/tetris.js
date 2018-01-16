
//======= Figure object start ========
function Figure(){
    y = 1; x = WIDTH / 2;
    this._figure = this._FIGURES[Math.floor(Math.random() * this._FIGURES.length)].concat([[0, 0]])
}

Figure.prototype._FIGURES = [ //Any figure consists of 4 points.
    //The central point always has a coordinates [0,0], so I list only the rest 3 points.
    [[0, -1],   [0, 1],  [0, 2]], // This is a stick
    [[-1, -1],  [0, -1], [1, 0]], //
    [[1, -1],   [0, -1], [-1, 0]],
    [[-1, 0],   [0, -1], [1, 0]],
    [[-2, 0],   [-1, 0], [0, -1]],
    [[0, -1],   [1, 0],  [2, 0]],
    [[-1, -1],  [0, -1], [-1, 0]]
];

// 90 degree, clockwise
Figure.prototype.rotate = function(){
    // FixMe: rotating square around any of its points looks like just shifting.

    var turnedFigure = new Array(this._figure.length);
    for (var i = 0; i < this._figure.length; i++)
        turnedFigure[i] = [-this._figure[i][1], this._figure[i][0]];
    if (!this.isOverlappedOrOutOfField(0, 0, turnedFigure))
        this._figure = turnedFigure
};

Figure.prototype.draw = function(){
    ctx.fillStyle = "lime";
    this._figure.forEach(function(i){
        ctx.fillRect((x + i[0]) * CUBE_SIDE, (y + i[1]) * CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
        ctx.strokeRect((x + i[0]) * CUBE_SIDE, (y + i[1]) * CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
    });
};

Figure.prototype.moveLeft = function() {
    console.log("moveLeft");
    if (!this.isOverlappedOrOutOfField(-1, 0))
        x--;
};

Figure.prototype.moveRight = function() {
    console.log("moveRight");
    if (!this.isOverlappedOrOutOfField(1, 0))
        x++;
};

Figure.prototype.isOverlappedOrOutOfField = function(xShift, yShift, figure){
    if (!figure)
        figure = this._figure;
    var result = false;
    figure.forEach(function(i, index){
        var newX = x + i[0] + xShift;
        var newY = y + i[1] + yShift;

        // Check if out of field first
        if (newX < 0 || newY < 0 || newX >= WIDTH || newY >= HEIGHT)
            result = true;
        else if (field[newX][newY])
            result = true
    });
    return result;
};

Figure.prototype.moveDown = function() {
    if (this.isOverlappedOrOutOfField(0,1))
        if (y==1) gameOver();
        else endOfTurn();
    else
        y++;
};

Figure.prototype.freeze = function() {
    this._figure.forEach(function (i, index) {
        field[(x + i[0])][(y + i[1])] = 1;
    });
};
//======= Figure object end ========



WIDTH = 20;
HEIGHT = 30;
CUBE_SIDE = 20;
var speed = 2; 
var x,y;
var f = new Figure();



window.onload = function(){
    canv = document.getElementById("tetris-field");
    canv.width = WIDTH * CUBE_SIDE;
    canv.height = HEIGHT * CUBE_SIDE;
    ctx = canv.getContext("2d");

    field = new Array(WIDTH);
    for (i = 0; i < WIDTH;i++)
        field[i] = new Array(HEIGHT)

    document.addEventListener("keydown", keyPush);
    gameTimer = setInterval(game, 1000 / speed);
    refreshTimer = setInterval(refresh, 1000 / 30)
    

};

function keyPush(evt){
    switch (evt.keyCode) {
        case 37:
            f.moveLeft();
            break;
        case 39:
            f.moveRight();
            break;
        case 40:
            f.moveDown();
            break;  
        case 32:
            f.rotate();
            break;  
        default:
            console.log("Key pressed, key code: " + evt.keyCode);
    }
}

function refresh(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    
    f.draw();

    ctx.fillStyle = "green";
    for (var xx = 0; xx < WIDTH; xx++)
        for (var yy = 0; yy < HEIGHT; yy++)
            if (field[xx][yy]){
                ctx.fillRect(xx * CUBE_SIDE, yy * CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
                ctx.strokeRect(xx * CUBE_SIDE, yy * CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
            }
}

function game(){
    f.moveDown();
}

function gameOver(){
    clearInterval(gameTimer);
    clearInterval(refreshTimer);
    refresh();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canv.width, canv.height);

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
    gameTimer = setInterval(game, 1000 / (speed))
    refreshTimer = setInterval(refresh, 1000 / 30)
    document.getElementById("pause").value = "Pause";
    document.getElementById("pause").onclick = pause
}

function endOfTurn(){
    f.freeze();
    f = new Figure();

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
        document.getElementById("speed").innerHTML = speed;
        clearInterval(gameTimer);
        gameTimer = setInterval(game, 1000 / (speed))

    }
    

}