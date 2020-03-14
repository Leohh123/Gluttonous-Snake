const N = 80;
const M = 60;
const DX = [-1, 0, 0, 1];
const DY = [0, -1, 1, 0];
const DRS = (function() {
    var t = [];
    t[97] = 0;
    t[65] = 0;
    t[119] = 1;
    t[87] = 1;
    t[100] = 3;
    t[68] = 3;
    t[115] = 2;
    t[83] = 2;
    return t;
})();

var Utils = (function() {
    function Utils() {
        var _this = this;
        Array.prototype.has = function(a) {
            for (var x of this) {
                if (_this.eq(a, x)) {
                    return true;
                }
            }
            return false;
        };
    }
    Utils.prototype.randint = function(x, y) {
        return x + Math.floor(Math.random() * (y - x));
    };
    Utils.prototype.eq = function(a, b) {
        return a[0] == b[0] && a[1] == b[1];
    };
    Utils.prototype.unique = function(a) {
        var ans = [];
        for (var x of a) {
            if (!ans.has(x)) {
                ans.push(x);
            }
        }
        return ans;
    };
    return new Utils();
})();

var Game = (function() {
    function Game(_run) {
        this._run = _run;
        this.length = 5;
        this.positions = [
            [40, 28],
            [40, 29],
            [40, 30],
            [40, 31],
            [40, 32]
        ];
        this.direction = 1;
        this.tmpDirection = 1;
        this.food = [0, 0];
    }
    Game.prototype.placeFood = function() {
        while (true) {
            var c = [Utils.randint(0, N - 1), Utils.randint(0, M - 1)];
            if (!this.positions.has(c)) {
                this.food = c;
                return;
            }
        }
    };
    Game.prototype.turn = function(to) {
        if (this.direction + to != 3) {
            this.tmpDirection = to;
        }
    };
    Game.prototype.move = function() {
        var to = [
            this.positions[0][0] + DX[this.direction],
            this.positions[0][1] + DY[this.direction]
        ];
        this.positions.splice(0, 0, to);
    };
    Game.prototype.eat = function() {
        if (Utils.eq(this.positions[0], this.food)) {
            return true;
        }
        return false;
    };
    Game.prototype.grow = function() {
        this.length++;
    };
    Game.prototype.cuttail = function() {
        while (this.positions.length > this.length) {
            this.positions.pop();
        }
    };
    Game.prototype.die = function() {
        var hx = this.positions[0][0];
        var hy = this.positions[0][1];
        if (hx < 0 || hx >= N) {
            return true;
        }
        if (hy < 0 || hy >= M) {
            return true;
        }
        if (Utils.unique(this.positions).length != this.positions.length) {
            return true;
        }
        return false;
    };
    return Game;
})();

var Renderer = (function() {
    function Renderer(_run) {
        this._run = _run;
        this.scale = 20;
        this.canvas = document.getElementById("canvas");
        canvas.width = N * this.scale;
        canvas.height = M * this.scale;
        this.ctx = canvas.getContext("2d");
        CanvasRenderingContext2D.prototype._fill = function(color) {
            this.save();
            this.beginPath();
            this.rect(0, 0, canvas.width, canvas.height);
            this.closePath();
            this.fillStyle = color;
            this.strokeStyle = "";
            this.fill();
            this.restore();
        };
        CanvasRenderingContext2D.prototype._rect = function(color, pos) {
            this.save();
            this.beginPath();
            this.rect(...pos);
            this.closePath();
            this.fillStyle = color;
            this.strokeStyle = "";
            this.fill();
            this.restore();
        };
    }
    Renderer.prototype.render = function(positions, food) {
        this.ctx._fill("rgb(0, 0, 0)");
        for (var a of positions) {
            var pos = [
                a[0] * this.scale,
                a[1] * this.scale,
                this.scale,
                this.scale
            ];
            this.ctx._rect("rgb(255, 255, 255)", pos);
        }
        var fpos = [
            food[0] * this.scale,
            food[1] * this.scale,
            this.scale,
            this.scale
        ];
        this.ctx._rect("rgb(0, 0, 255)", fpos);
    };
    return Renderer;
})();

var Input = (function() {
    function Input(_run) {
        this._run = _run;
        this.pressEvent = [];
        var _this = this;
        document.onkeypress = function(event) {
            var e =
                event || window.event || arguments.callee.caller.arguments[0];
            console.log("press", e.keyCode);
            if (e && _this.pressEvent[e.keyCode]) {
                _this.pressEvent[e.keyCode](e.keyCode);
            }
        };
    }
    Input.prototype.setEvent = function(f, codes) {
        for (var c of codes) {
            this.pressEvent[c] = f;
        }
    };
    return Input;
})();

var Run = (function() {
    function Run() {
        this.start = false;
        this.speed = 100;
        this.renderer = new Renderer(this);
        this.input = new Input(this);
    }
    Run.prototype.init = function() {
        var _this = this;
        this.input.setEvent(
            function() {
                _this.start = !_this.start;
            },
            [80, 112]
        );
        this.input.setEvent(
            function(c) {
                if (_this.start) {
                    _this.game.turn(DRS[c]);
                }
            },
            [97, 65, 119, 87, 100, 68, 115, 83]
        );
    };
    Run.prototype.run = function() {
        this.game = new Game(this);
        this.game.placeFood();
        this.start = true;
        var _this = this;
        this.whileID = setInterval(() => {
            if (_this.start) {
                _this.game.direction = _this.game.tmpDirection;
                _this.game.move();
                if (_this.game.eat()) {
                    _this.game.grow();
                    _this.game.placeFood();
                }
                _this.game.cuttail();
                if (_this.game.die()) {
                    _this.game = new Game();
                    _this.game.placeFood();
                }
                _this.renderer.render(_this.game.positions, _this.game.food);
            }
        }, this.speed);
    };
    return Run;
})();
var _Run = new Run();
_Run.init();
_Run.run();
