constants = {
    WIDTH: 20,
    HEIGHT: 30,
    CUBE_SIDE: 20,
    FIGURES: [ //Any figure consists of 4 points.
        //The central point always has a coordinates [0,0], so I list only the rest 3 points.
        [[0, 0],[0, -1], [0, 1], [0, 2]], // This is a stick
        [[0, 0],[-1, -1], [0, -1], [1, 0]], //
        [[0, 0],[1, -1], [0, -1], [-1, 0]],
        [[0, 0],[-1, 0], [0, -1], [1, 0]],
        [[0, 0],[-2, 0], [-1, 0], [0, -1]],
        [[0, 0],[0, -1], [1, 0], [2, 0]],
        [[0, 0],[-1, -1], [0, -1], [-1, 0]]
    ]
};
constants.WIDTH_PX = constants.WIDTH * constants.CUBE_SIDE;
constants.HEIGHT_PX = constants.HEIGHT * constants.CUBE_SIDE;

Object.defineProperty(Array.prototype, 'getRandomItem',{
    enumerable: false,
    writable: false,
    value: function(){
    return this[Math.floor(Math.random() * this.length)];
}});
CanvasRenderingContext2D.prototype.drawCube = function(cube){
    let CS = constants.CUBE_SIDE;
    this.fillRect(cube[0] * CS, cube[1] * CS, CS, CS);
    this.strokeRect(cube[0] * CS, cube[1] * CS, CS, CS);
};

class Figure {
    constructor() {
        this.y = 1;
        this.x = constants.WIDTH / 2;
        this.cubes = constants.FIGURES.getRandomItem();
    }

    // 90 degree, clockwise
    rotate() {
        // FixMe: rotating square around any of its points looks like just shifting.
        let turnedFigure = new Array(this.cubes.length);
        for (let i = 0; i < this.cubes.length; i++)
            turnedFigure[i] = [-this.cubes[i][1], this.cubes[i][0]];
        if (!this.isOverlappedOrOutOfField(0, 0, turnedFigure))
            this.cubes = turnedFigure
    }

    draw(ctx) {
        ctx.fillStyle = "lime";
        ctx.translate(this.x * constants.CUBE_SIDE, this.y * constants.CUBE_SIDE);
        this.cubes.forEach((cube)=>{ctx.drawCube(cube)});
        ctx.resetTransform();
    }

    moveLeft() {
        if (!this.isOverlappedOrOutOfField(-1, 0))
            this.x--;
    }

    moveRight() {
        if (!this.isOverlappedOrOutOfField(1, 0))
            this.x++;
    };

    moveDown() {
        if (this.isOverlappedOrOutOfField(0, 1))
            if (this.y === 1) game.over();
            else game.endOfTurn();
        else
            this.y++;
    }

    isOverlappedOrOutOfField(xShift, yShift, figure) {
        if (!figure)
            figure = this.cubes;
        let result = false;
        for (var i in figure) {
            let newX = this.x + figure[i][0] + xShift;
            let newY = this.y + figure[i][1] + yShift;

            // Check if out of field first
            if (newX < 0 || newY < 0 || newX >= constants.WIDTH || newY >= constants.HEIGHT)
                result = true;
            else if (game.gameField[newX][newY])
                result = true
        }
        return result;
    };
}

game = {
    state: "not initialized",

    keyMapping: {
        37: Figure.prototype.moveLeft,
        39: Figure.prototype.moveRight,
        40: Figure.prototype.moveDown,
        32: Figure.prototype.rotate,
    },

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

        document.addEventListener("keydown", this.keyPush.bind(this));
        this.gameTimer = setInterval(this.tick, 1000 / this.getSpeed());
        this.state = "run";
    },

    tick: function(){
        game.f.moveDown();
        game.refresh();
    },

    getSpeed: function () {
        return Math.ceil((this.score+1) / 5)
    },

    keyPush: function (evt) {
        if (game.state != "run") return;
        let action = this.keyMapping[evt.keyCode];
        if (action) action.call(this.f);
        game.refresh();
    },

    refresh: function () {
        if (this.state != "run")
            return;
        this.ctx.fillStyle = "rgba(0,0,0,0.8)";
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);

        this.f.draw(this.ctx);

        this.ctx.fillStyle = "green";
        for (var xx = 0; xx < constants.WIDTH; xx++)
            for (var yy = 0; yy < constants.HEIGHT; yy++)
                if (this.gameField[xx][yy])
                    this.ctx.drawCube([xx, yy]);
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
        this.f.cubes.forEach((cube)=>{
                this.gameField[(this.f.x + cube[0])][(this.f.y + cube[1])] = 1;
            });
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