constants = {
    WIDTH: 20,
    HEIGHT: 30,
    CUBE_SIDE: 20
};
constants.WIDTH_PX = constants.WIDTH * constants.CUBE_SIDE;
constants.HEIGHT_PX = constants.HEIGHT * constants.CUBE_SIDE;


//======= Figure object start ========
function Figure() {
    this.y = 1;
    this.x = constants.WIDTH / 2;
    this._figure = this._FIGURES[Math.floor(Math.random() * this._FIGURES.length)].concat([[0, 0]])
}

Figure.prototype._FIGURES = [ //Any figure consists of 4 points.
    //The central point always has a coordinates [0,0], so I list only the rest 3 points.
    [[0, -1], [0, 1], [0, 2]], // This is a stick
    [[-1, -1], [0, -1], [1, 0]], //
    [[1, -1], [0, -1], [-1, 0]],
    [[-1, 0], [0, -1], [1, 0]],
    [[-2, 0], [-1, 0], [0, -1]],
    [[0, -1], [1, 0], [2, 0]],
    [[-1, -1], [0, -1], [-1, 0]]
];

// 90 degree, clockwise
Figure.prototype.rotate = function () {
    // FixMe: rotating square around any of its points looks like just shifting.

    var turnedFigure = new Array(this._figure.length);
    for (var i = 0; i < this._figure.length; i++)
        turnedFigure[i] = [-this._figure[i][1], this._figure[i][0]];
    if (!this.isOverlappedOrOutOfField(0, 0, turnedFigure))
        this._figure = turnedFigure
};

Figure.prototype.draw = function () {
    game.ctx.fillStyle = "lime";
    for(var i in this._figure) {
        var coord = this._figure[i]
        game.ctx.fillRect((this.x + coord[0]) * constants.CUBE_SIDE, (this.y + coord[1]) * constants.CUBE_SIDE, constants.CUBE_SIDE, constants.CUBE_SIDE);
        game.ctx.strokeRect((this.x + coord[0]) * constants.CUBE_SIDE, (this.y + coord[1]) * constants.CUBE_SIDE, constants.CUBE_SIDE, constants.CUBE_SIDE);
    }
};

Figure.prototype.moveLeft = function () {
    console.log("moveLeft");
    if (!this.isOverlappedOrOutOfField(-1, 0))
        this.x--;
};

Figure.prototype.moveRight = function () {
    console.log("moveRight");
    if (!this.isOverlappedOrOutOfField(1, 0))
        this.x++;
};

Figure.prototype.isOverlappedOrOutOfField = function (xShift, yShift, figure) {
    if (!figure)
        figure = this._figure;
    var result = false;
    for (var i in figure) {
        var newX = this.x + figure[i][0] + xShift;
        var newY = this.y + figure[i][1] + yShift;

        // Check if out of field first
        if (newX < 0 || newY < 0 || newX >= constants.WIDTH || newY >= constants.HEIGHT)
            result = true;
        else if (game.gameField[newX][newY])
            result = true
    }
    return result;
};

Figure.prototype.moveDown = function () {
    if (this.isOverlappedOrOutOfField(0, 1))
        if (this.y === 1) game.over();
        else game.endOfTurn();
    else
        this.y++;
};

Figure.prototype.freeze = function () {
    for (var i in this._figure){
        coord = this._figure[i]
        game.gameField[(this.x + coord[0])][(this.y + coord[1])] = 1;
    };
};
//======= Figure object end ========


game = {
    state: "not initialized",
    init: function () {
        this.score =  0;
        this.canv = document.getElementById("tetris-field");
        this.canv.width = constants.WIDTH_PX;
        this.canv.height = constants.HEIGHT_PX;
        this.ctx = this.canv.getContext("2d");
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
        this.gameField = new Array(constants.WIDTH);
        for (i = 0; i < constants.WIDTH; i++)
            this.gameField[i] = new Array(constants.HEIGHT)

        this.f = new Figure();

        document.addEventListener("keydown", this.keyPush);
        this.gameTimer = setInterval(this.tick, 1000 / this.getSpeed());
        this.state = "run";
    },

    tick: function () {
        game.f.moveDown();
        game.refresh();
    },

    getSpeed: function () {
        return Math.ceil((this.score+1) / 5)
    },

    keyPush: function (evt) {
        if (game.state != "run") return;
        switch (evt.keyCode) {
            case 37:
                game.f.moveLeft();
                break;
            case 39:
                game.f.moveRight();
                break;
            case 40:
                game.f.moveDown();
                break;
            case 32:
                game.f.rotate();
                break;
            default:
                console.log("Key pressed, key code: " + evt.keyCode);
        }
        game.refresh();
    },
    refresh: function () {
        if (this.state != "run")
            return;
        this.ctx.fillStyle = "rgba(0,0,0,0.8)";
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);

        this.f.draw();

        this.ctx.fillStyle = "green";
        for (var xx = 0; xx < constants.WIDTH; xx++)
            for (var yy = 0; yy < constants.HEIGHT; yy++)
                if (this.gameField[xx][yy]) {
                    this.ctx.fillRect(xx * constants.CUBE_SIDE, yy * constants.CUBE_SIDE, constants.CUBE_SIDE, constants.CUBE_SIDE);
                    this.ctx.strokeRect(xx * constants.CUBE_SIDE, yy * constants.CUBE_SIDE, constants.CUBE_SIDE, constants.CUBE_SIDE);
                }
    },

    over: function () {
        clearInterval(this.gameTimer);
        this.refresh();

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, constants.WIDTH_PX, constants.HEIGHT_PX);

        this.ctx.font = "30px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "red";
        this.ctx.fillText("Game Over", constants.WIDTH_PX / 2, constants.HEIGHT_PX / 2);
        this.state = "over";
    },
    pause: function () {
        clearInterval(game.gameTimer);
        document.getElementById("pause").value = "Resume";
        document.getElementById("pause").onclick = game.resume
        game.state = "paused";
    },

    resume: function () {
        game.gameTimer = setInterval(game.tick, 1000 / game.getSpeed());
        document.getElementById("pause").value = "Pause";
        document.getElementById("pause").onclick = game.pause;
        game.state = "run";
    },

    endOfTurn: function () {
        this.f.freeze();
        this.f = new Figure();

        // Check if any row is complete
        rowLoop:
            for (var yy = constants.HEIGHT - 1; yy > 0; yy--) {
                for (var xx = 0; xx < constants.WIDTH; xx++)
                    if (!this.gameField[xx][yy])
                        continue rowLoop;
                // following code removes a complete row
                for (var yyy = yy; yyy > 0; yyy--)
                    for (var xx = 0; xx < constants.WIDTH; xx++)
                        this.gameField[xx][yyy] = this.gameField[xx][yyy - 1];
                yy++; // Current row is replaced, so it should be checked again
                this.score++;
                document.getElementById("score").innerHTML = this.score;
                document.getElementById("speed").innerHTML = this.getSpeed();
                clearInterval(this.gameTimer);
                this.gameTimer = setInterval(this.tick, 1000 / this.getSpeed())
            }
    }
};


game.init();