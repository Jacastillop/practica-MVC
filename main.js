(function () {
    self.Board = function (width, height) {
        this.width = width;
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;
        this.playing = false;
    };

    self.Board.prototype = {
        get element() {
            var elements = this.bars.map(function (bar) { return bar; });
            elements.push(this.ball);
            return elements;
        },
    };
})();

(function () {
    self.Ball = function (x, y, radius, board) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.board = board;
        this.speed_x = 5;
        this.speed_y = 0;
        this.kind = "circle"
        this.direction = 1;
        this.bounce_angle=0;
        this.max_bounce_angle= Math.PI/12;
        this.speed=3;
        board.ball = this;
    }

    self.Ball.prototype = {
        move: function () {
            this.x += (this.speed_x * this.direction);
            this.y += (this.speed_y);
        },
        get width(){
            return this.radius*2;
        },
        get height(){
            return this.radius*2;
        },
        collision: function (bar) {
            //Reacciona a la colisiona con una barra que recibe como parametro  
            var relative_intersect_y = (bar.y + (bar.height / 2)) - this.y;

            var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

            this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

            this.speed_y = this.speed * -Math.sin(this.bounce_angle);
            this.speed_x = this.speed * Math.cos(this.bounce_angle);

            if (this.x > (this.board.width / 2)) this.direction = -1;
            else this.direction = 1;
        }
    }
})();

(function () {
    self.Bar = function (x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 10;
    };

    self.Bar.prototype = {
        down: function () {
            this.y += this.speed;
        },
        up: function () {
            this.y -= this.speed;
        },
        toString: function () {
            return "x: " + this.x + " y: " + this.y;
        },
    };
})();

(function () {
    self.BoardView = function (canvas, board) {
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d");
    };

    self.BoardView.prototype = {
        clean: function () {
            this.ctx.clearRect(0, 0, this.board.width, this.board.height);
        },
        draw: function () {
            for (var i = this.board.element.length - 1; i >= 0; i--) {
                var el = this.board.element[i];
                draw(this.ctx, el);
            }
        },
        check_collisions: function () {
            for (let i = this.board.bars.length - 1; i >= 0; i--) {
                var bar = this.board.bars[i];
                if (hit(bar, this.board.ball)) {
                    this.board.ball.collision(bar);
                }
            }
        },
        play: function () {
            if (this.board.playing) {
                this.clean();
                this.check_collisions();
                this.draw();
                this.board.ball.move();
            }
        },
    };

    function hit(a, b) {
        //Revisa si a colisiona con b
        var hit = false;
        //Colisiones hirizontales
        if (b.x + b.width >= a.x && b.x < a.x + a.width) {

            //Colisiona verticales
            if (b.y + b.height >= a.y && b.y < a.y + a.height)
                hit = true;
        }

        //Colisión de a con b
        if (b.x <= a.x && b.x + b.width >= a.x + a.width) {

            if (b.y <= a.y && b.y + b.height >= a.y + a.height)
                hit = true;
        }

        //Colision b con a
        if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
            //Colisiona verticales
            if (a.y <= b.y && a.y + a.height >= b.y + b.height)
                hit = true;
        }
        return hit;
    }

    function draw(ctx, element) {
        switch (element.kind) {
            case "rectangle":
                ctx.fillRect(element.x, element.y, element.width, element.height);
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(element.x, element.y, element.radius, 0, 7);
                ctx.fill();
                ctx.closePath();
                break;

        }
    }
})();

var board = new Board(800, 400);
var bar = new Bar(20, 100, 40, 100, board);
var bar_2 = new Bar(740, 100, 40, 100, board);
var ball = new Ball(350, 100, 10, board);
var canvas = document.getElementById("canvas");
var board_view = new BoardView(canvas, board);

Document,
    addEventListener("keydown", function (event) {

        if (event.keyCode === 38) {
            event.preventDefault();
            bar.up();
        }
        else if (event.keyCode === 40) {
            event.preventDefault();
            bar.down();
        }
        else if (event.keyCode === 87) {
            event.preventDefault();
            bar_2.up();
        }
        else if (event.keyCode === 83) {
            event.preventDefault();
            bar_2.down();
        }
        else if (event.keyCode === 32) {
            event.preventDefault();
            board.playing = !board.playing;
        }
    });

board_view.draw();
window.requestAnimationFrame(controller);

function controller() {
    board_view.play();
    window.requestAnimationFrame(controller);
}
