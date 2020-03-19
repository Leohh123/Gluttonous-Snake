const N = 80;
const M = 60;
const DX = [-1, 0, 0, 1];
const DY = [0, -1, 1, 0];
const DS2 = ["l", "u", "d", "r"];
const DS3 = ["h", "v", "lu", "ru", "ld", "rd"];
// const SPD = [1000, 100, 75, 50, 25, 15, 10];
const SPD = [1000, 100, 80, 60, 50, 40, 30];
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
        return x + Math.floor(Math.random() * (y - x + 1));
    };
    Utils.prototype.eq = function(...a) {
        for (var i = 1; i < a.length; i++) {
            if (a[0][0] != a[i][0] || a[0][1] != a[i][1]) {
                return false;
            }
        }
        return true;
    };
    Utils.prototype.mov = function(a, d) {
        if (d == "u") {
            return [a[0], a[1] - 1];
        }
        if (d == "d") {
            return [a[0], a[1] + 1];
        }
        if (d == "l") {
            return [a[0] - 1, a[1]];
        }
        if (d == "r") {
            return [a[0] + 1, a[1]];
        }
        console.error("Utils.mov", "Invalid direction");
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
    Utils.prototype.checkShape = function(a, b, c) {
        if (!a || !c) {
            var t = !a ? c : a;
            for (var d of DS2) {
                if (this.eq(this.mov(t, d), b)) {
                    return d;
                }
            }
            console.error("Utils.checkShape", "Head or tail: no answer");
        }
        if (
            this.eq(this.mov(a, "r"), this.mov(c, "l"), b) ||
            this.eq(this.mov(c, "r"), this.mov(a, "l"), b)
        ) {
            return "h";
        }
        if (
            this.eq(this.mov(a, "d"), this.mov(c, "u"), b) ||
            this.eq(this.mov(c, "d"), this.mov(a, "u"), b)
        ) {
            return "v";
        }
        if (
            this.eq(this.mov(a, "l"), this.mov(c, "d"), b) ||
            this.eq(this.mov(c, "l"), this.mov(a, "d"), b)
        ) {
            return "lu";
        }
        if (
            this.eq(this.mov(a, "r"), this.mov(c, "d"), b) ||
            this.eq(this.mov(c, "r"), this.mov(a, "d"), b)
        ) {
            return "ru";
        }
        if (
            this.eq(this.mov(a, "l"), this.mov(c, "u"), b) ||
            this.eq(this.mov(c, "l"), this.mov(a, "u"), b)
        ) {
            return "ld";
        }
        if (
            this.eq(this.mov(a, "r"), this.mov(c, "u"), b) ||
            this.eq(this.mov(c, "r"), this.mov(a, "u"), b)
        ) {
            return "rd";
        }
        console.error("Utils.checkShape", "Body: no answer");
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
        this.score = 0;
        this.level = 1;
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
    Game.prototype.init = function() {
        this.placeFood();
    };
    Game.prototype.go = function() {
        this.direction = this.tmpDirection;
        this.move();
        if (this.eat()) {
            this.grow();
            this.placeFood();
        }
        this.cuttail();
        if (this.die()) {
            return false;
        }
        this.score = this.length - 5;
        this.level = Math.min(6, Math.floor(1 + this.score / 5));
        return true;
    };
    return Game;
})();

var Resource = (function() {
    function Resource() {
        this.res = {};
    }
    Resource.prototype.add = function(name, src, type = "image") {
        if (!this.res[name]) {
            var obj;
            if (type == "image") {
                obj = new Image();
                obj.src = src;
            }
            this.res[name] = obj;
        }
    };
    Resource.prototype.get = function(name) {
        return this.res[name];
    };
    return Resource;
})();

var Renderer = (function() {
    function Renderer(_run) {
        this._run = _run;
        var w = window.innerWidth;
        var h = window.innerHeight;
        this.scale = Math.min(w / (N + 1), h / (M + 1));
        this.canvas = document.getElementById("canvas");
        this.canvas.width = N * this.scale;
        this.canvas.height = M * this.scale;
        this.ctx = canvas.getContext("2d");
        this.resourse = new Resource();
        CanvasRenderingContext2D.prototype._fill = function(color) {
            this.save();
            this.beginPath();
            this.rect(0, 0, canvas.width, canvas.height);
            this.closePath();
            this.fillStyle = color;
            this.fill();
            this.restore();
        };
        CanvasRenderingContext2D.prototype._rect = function(color, x, y, w, h) {
            this.save();
            this.beginPath();
            this.rect(x, y, w, h);
            this.closePath();
            this.fillStyle = color;
            this.fill();
            this.restore();
        };
        CanvasRenderingContext2D.prototype._image = function(img, x, y, w, h) {
            this.save();
            this.imageSmoothingEnabled = false;
            this.drawImage(img, x, y, w, h);
            this.restore();
        };
    }
    Renderer.prototype.init = function() {
        this.resourse.add("grass", "./image/grass.png");
        this.resourse.add("food", "./image/food.png");
        for (var d of DS2) {
            this.resourse.add(`head${d}`, `./image/head${d}.png`);
            this.resourse.add(`tail${d}`, `./image/tail${d}.png`);
        }
        for (var d of DS3) {
            this.resourse.add(`body${d}`, `./image/body${d}.png`);
        }
    };
    Renderer.prototype.renderBackground = function() {
        for (var i = 0; i < N; i += 8) {
            for (var j = 0; j < M; j += 8) {
                this.ctx._image(
                    this.resourse.get("grass"),
                    i * this.scale,
                    j * this.scale,
                    8 * this.scale,
                    8 * this.scale
                );
            }
        }
    };
    Renderer.prototype.renderGame = function(positions, food) {
        for (var i = 0; i < positions.length; i++) {
            var sp = Utils.checkShape(
                positions[i - 1],
                positions[i],
                positions[i + 1]
            );
            var pos = [
                positions[i][0] * this.scale,
                positions[i][1] * this.scale,
                this.scale,
                this.scale
            ];
            if (i == 0) {
                this.ctx._image(this.resourse.get(`head${sp}`), ...pos);
            } else if (i == positions.length - 1) {
                this.ctx._image(this.resourse.get(`tail${sp}`), ...pos);
            } else {
                this.ctx._image(this.resourse.get(`body${sp}`), ...pos);
            }
        }
        this.ctx._image(
            this.resourse.get("food"),
            food[0] * this.scale,
            food[1] * this.scale,
            this.scale,
            this.scale
        );
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
            if (e && _this.pressEvent[e.keyCode]) {
                _this.pressEvent[e.keyCode](e.keyCode);
            }
            // console.log("press", e.keyCode);
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
        this.renderer = new Renderer(this);
        this.input = new Input(this);
    }
    Run.prototype.init = function() {
        var _this = this;
        this.input.setEvent(
            function(c) {
                if (_this.start) {
                    _this.game.turn(DRS[c]);
                }
            },
            [97, 65, 119, 87, 100, 68, 115, 83]
        );
        this.input.setEvent(
            function() {
                if (_this.start) {
                    _this.pause();
                    gamePause();
                } else {
                    _this.resume();
                    gameResume();
                }
            },
            [80, 112]
        );
        this.renderer.init();
    };
    Run.prototype.newGame = function() {
        this.game = new Game(this);
        this.game.init();
        this.speed = SPD[this.game.level];
    };
    Run.prototype.gameLoop = function(_this) {
        if (_this.start) {
            if (!_this.game.go()) {
                _this.pause();
                gameOver();
            }
        }
        _this.renderer.renderBackground();
        if (!_this.onIndex) {
            _this.renderer.renderGame(_this.game.positions, _this.game.food);
            updateInfo(_this.game.score, _this.game.level);
        }
        // if (_this.speed != SPD[_this.game.level]) {
        //     clearInterval(_this.whileID);
        //     _this.speed = SPD[_this.game.level];
        //     _this.whileID = setInterval(() => {
        //         _this.gameLoop(_this);
        //     }, _this.speed);
        // }
        setTimeout(() => {
            _this.gameLoop(_this);
        }, SPD[_this.game.level]);
    };
    Run.prototype.run = function() {
        this.newGame();
        this.start = false;
        this.onIndex = true;
        var _this = this;
        // this.whileID = setInterval(() => {
        //     _this.gameLoop(_this);
        // }, this.speed);
        setTimeout(() => {
            _this.gameLoop(_this);
        }, SPD[this.game.level]);
    };
    Run.prototype.pause = function() {
        this.start = false;
    };
    Run.prototype.resume = function() {
        this.start = true;
        this.onIndex = false;
    };
    return Run;
})();

/* UI */
var DIV_wrap = document.getElementById("wrap");
var IMG_try = document.getElementById("try");
var IMG_pause = document.getElementById("pause");
var DIV_info = document.getElementById("info");
var SPAN_score = document.getElementById("score");
var SPAN_level = document.getElementById("level");

function start() {
    _Run.newGame();
    _Run.resume();
    DIV_wrap.style.display = "none";
    IMG_try.style.display = "none";
    IMG_pause.style.display = "none";
}

function gameOver() {
    IMG_try.style.display = "inline";
}

function gamePause() {
    IMG_pause.style.display = "inline";
}

function gameResume() {
    IMG_pause.style.display = "none";
}

function updateInfo(score, level) {
    DIV_info.style.display = "block";
    SPAN_score.innerHTML = `SCORE: ${score}`;
    SPAN_level.innerHTML = `LEVEL: ${level}`;
}

/* Main */
var _Run = new Run();
_Run.init();
_Run.run();
