const N = 80;
const M = 60;
const SCALE = 20;
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

var canvas = document.getElementById("canvas");
canvas.width = N * SCALE;
canvas.height = M * SCALE;
var ctx = canvas.getContext("2d");

var pressEvent = [];

var length;
var positions = [];
var direction;
var tmpDirection;
var food;
var speed = 100;
var start = true;

function randint(x, y) {
    return x + Math.floor(Math.random() * (y - x));
}

function eq(a, b) {
    return a[0] == b[0] && a[1] == b[1];
}

function unique(a) {
    var ans = [];
    for (var x of a) {
        if (!ans.has(x)) {
            ans.push(x);
        }
    }
    return ans;
}

Array.prototype.has = function(a) {
    for (var x of this) {
        if (eq(a, x)) {
            return true;
        }
    }
    return false;
};

function init() {
    length = 5;
    positions = [
        [40, 28],
        [40, 29],
        [40, 30],
        [40, 31],
        [40, 32]
    ];
    direction = 1;
    tmpDirection = 1;
    food = [0, 0];
}

function placeFood() {
    while (true) {
        c = [randint(0, N - 1), randint(0, M - 1)];
        if (!positions.has(c)) {
            food = c;
            return;
        }
    }
}

function turn(to) {
    if (direction + to != 3) {
        tmpDirection = to;
    }
}

function move() {
    var to = [positions[0][0] + DX[direction], positions[0][1] + DY[direction]];
    positions.splice(0, 0, to);
}

function eat() {
    if (eq(positions[0], food)) {
        return true;
    }
    return false;
}

function cuttail() {
    while (positions.length > length) {
        positions.pop();
    }
}

function die() {
    var hx = positions[0][0];
    var hy = positions[0][1];
    if (hx < 0 || hx >= N) {
        return true;
    }
    if (hy < 0 || hy >= M) {
        return true;
    }
    if (unique(positions).length != positions.length) {
        return true;
    }
    return false;
}

function render() {
    ctx._fill("rgb(0, 0, 0)");
    for (var a of positions) {
        var pos = [a[0] * SCALE, a[1] * SCALE, SCALE, SCALE];
        ctx._rect("rgb(255, 255, 255)", pos);
    }
    var fpos = [food[0] * SCALE, food[1] * SCALE, SCALE, SCALE];
    ctx._rect("rgb(0, 0, 255)", fpos);
}

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
    console.log("rect", color, pos);
    this.save();
    this.beginPath();
    this.rect(...pos);
    this.closePath();
    this.fillStyle = color;
    this.strokeStyle = "";
    this.fill();
    this.restore();
};

document.onkeypress = function(event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    console.log("press", e.keyCode);
    if (e && pressEvent[e.keyCode]) {
        pressEvent[e.keyCode](e.keyCode);
    }
};
(function() {
    function tmp() {
        start = !start;
    }
    pressEvent[80] = tmp;
    pressEvent[112] = tmp;
})();

(function() {
    function tmp(kcode) {
        if (start) {
            turn(DRS[kcode]);
        }
    }
    var a = [97, 65, 119, 87, 100, 68, 115, 83];
    for (var x of a) {
        pressEvent[x] = tmp;
    }
})();

function gameloop() {
    init();
    placeFood();
    var whileID = setInterval(() => {
        if (start) {
            direction = tmpDirection;
            move();
            if (eat()) {
                length++;
                placeFood();
            }
            cuttail();
            if (die()) {
                init();
                placeFood();
            }
            render();
        }
    }, speed);
}
gameloop();
