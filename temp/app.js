/// <reference path="scripts/typings/jquery/jquery.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var drag = false;
var i = 0;
var canvas;
var CANVAS_WIDTH = 1100;
var CANVAS_HEIGHT = 500;
var ctx;
var $canvas = $("#canvas");
var offsetX;
var offsetY;
var numberOfCircles = 3;
var circlesMass = [];
var radiusNumber = 10;
var isDown = false;
var lastX;
var lastY;
var draggingCircle;
var parallelogram;
window.onload = function () {
    canvas = document.getElementById("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx = canvas.getContext("2d");
    var canvasOffset = $canvas.offset();
    offsetX = canvasOffset.left;
    offsetY = canvasOffset.top;
};
function PutAPoint(event) {
    if (circlesMass.length < numberOfCircles) {
        var point = getCursorPosition(canvas, event);
        if (checkIfPointCircleIsOnCanvas(point, radiusNumber)) {
            var circlePoint = getCircle(point, radiusNumber);
            circlePoint.drawFigure(true);
            circlesMass.push(circlePoint);
            if (circlesMass.length == numberOfCircles) {
                $("#reset").css("visibility", "visible");
                parallelogram = new Parallelogram(COLOR.BLUE, circlesMass[0].centerPoint, circlesMass[1].centerPoint, circlesMass[2].centerPoint);
                setAreaLabel(parallelogram);
            }
            setCoordinatesLabels(circlesMass);
        }
    }
}
function setCoordinatesLabels(circlesMass) {
    for (var i = 0; i < circlesMass.length; i++) {
        var str = "";
        switch (i) {
            case 0:
                str += "A";
                break;
            case 1:
                str += "B";
                break;
            case 2:
                str += "C";
                break;
        }
        str += " ( " + circlesMass[i].centerPoint.x + " , " + circlesMass[i].centerPoint.y + " ) ";
        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillText(str, circlesMass[i].centerPoint.x, circlesMass[i].centerPoint.y - 10);
    }
}
function setAreaLabel(parallelogram) {
    ctx.beginPath();
    var str = "Area: " + parallelogram.Area.toFixed(2);
    ctx.fillText(str, parallelogram.CenterOfMass.x - 60, parallelogram.CenterOfMass.y);
}
function clearField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circlesMass = [];
    $("#reset").css("visibility", "hidden");
}
function redrawingCircles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function getCursorPosition(canvas, event) {
    var x = event.clientX;
    var y = event.clientY;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    return new Point(x, y);
}
function getCircle(point, radius) {
    return new Circle(COLOR.RED, point, radius);
}
function checkIfPointCircleIsOnCanvas(point, radius) {
    return (point.x - radius > 0 && point.x + radius < CANVAS_WIDTH && point.y - radius > 0 && point.y + radius < CANVAS_HEIGHT) ? true : false;
}
var hit = -1;
$canvas.mousedown(function (e) {
    drag = true;
    lastX = e.clientX - offsetX;
    lastY = e.clientY - offsetY;
    if (circlesMass.length != 3) {
        PutAPoint(event);
    }
    else {
        for (var i = 0; i < circlesMass.length; i++) {
            var circle = circlesMass[i];
            var dx = lastX - circle.centerPoint.x;
            var dy = lastY - circle.centerPoint.y;
            if (dx * dx + dy * dy < Math.pow(circle.radius, 2)) {
                hit = i;
                break;
            }
        }
        if (hit != -1) {
            isDown = true;
            draggingCircle = circlesMass[hit];
        }
        else {
            draggingCircle = null;
        }
    }
});
$canvas.mousemove(function () {
    if (!drag) {
        return;
    }
    if (isDown && hit != -1) {
        var currentCursorPosition = getCursorPosition(canvas, event);
        if (checkIfPointCircleIsOnCanvas(currentCursorPosition, radiusNumber)) {
            var dx = currentCursorPosition.x - lastX;
            var dy = currentCursorPosition.y - lastY;
            lastX = currentCursorPosition.x;
            lastY = currentCursorPosition.y;
            draggingCircle.centerPoint.x += dx;
            draggingCircle.centerPoint.y += dy;
            redrawingCircles();
            for (var i = 0; i < circlesMass.length; i++) {
                circlesMass[i].drawFigure(true);
            }
            parallelogram = new Parallelogram(COLOR.BLUE, circlesMass[0].centerPoint, circlesMass[1].centerPoint, circlesMass[2].centerPoint);
            setCoordinatesLabels(circlesMass);
            setAreaLabel(parallelogram);
        }
    }
    else
        hit = -1;
});
$canvas.mouseup(function () {
    i = 0;
    hit = -1;
});
$(document).mouseup(function () {
    drag = false;
});
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
var Point = /** @class */ (function () {
    //public name: enum -- (names of points - A, B, C)
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Figure = /** @class */ (function () {
    function Figure(color) {
        this.color = color;
    }
    return Figure;
}());
var COLOR;
(function (COLOR) {
    COLOR[COLOR["RED"] = 0] = "RED";
    COLOR[COLOR["BLUE"] = 1] = "BLUE";
    COLOR[COLOR["ORANGE"] = 2] = "ORANGE";
})(COLOR || (COLOR = {}));
;
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(color, centerPoint, radius) {
        var _this = _super.call(this, color) || this;
        _this.centerPoint = centerPoint;
        _this.radius = radius;
        return _this;
    }
    Circle.prototype.drawFigure = function (fillFlag) {
        ctx.beginPath();
        ctx.arc(this.centerPoint.x, this.centerPoint.y, this.radius, 0, Circle.pi2, false);
        var color = this.color;
        var colorStr = COLOR[color];
        if (fillFlag) {
            ctx.fillStyle = colorStr;
            ctx.fill();
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = colorStr;
        ctx.stroke();
    };
    Circle.pi2 = 2 * Math.PI;
    Circle.pi = Math.PI;
    return Circle;
}(Figure));
var Parallelogram = /** @class */ (function (_super) {
    __extends(Parallelogram, _super);
    function Parallelogram(color, A, B, C) {
        var _this = _super.call(this, color) || this;
        _this.A = A;
        _this.B = B;
        _this.C = C;
        _this.setTheFourthPoint();
        _this.drawFigure();
        _this.setArea();
        _this.circleInParall = new Circle(COLOR.ORANGE, _this.CenterOfMass, _this.getRadiusByArea());
        _this.circleInParall.drawFigure(false);
        return _this;
    }
    Parallelogram.prototype.getRadiusByArea = function () {
        return Math.sqrt(this.Area / Circle.pi);
    };
    Parallelogram.prototype.setArea = function () {
        var a;
        var b;
        a = this.getLineLengthByTwoPoints(this.A, this.B);
        b = this.getLineLengthByTwoPoints(this.B, this.C);
        var cosA;
        var sinA;
        cosA = ((this.B.x - this.A.x) * (this.B.y - this.A.y) + (this.B.x - this.C.x) * (this.B.y - this.C.y)) / (a * b);
        sinA = Math.sqrt(1 - Math.pow(cosA, 2));
        this.Area = a * b * sinA;
    };
    Parallelogram.prototype.setTheFourthPoint = function () {
        var Xd = (this.A.x + this.C.x) / 2;
        var Yd = (this.A.y + this.C.y) / 2;
        this.CenterOfMass = new Point(Xd, Yd);
        Xd = 2 * Xd - this.B.x;
        Yd = 2 * Yd - this.B.y;
        this.D = new Point(Xd, Yd);
    };
    Parallelogram.prototype.getLineLengthByTwoPoints = function (A, B) {
        return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    };
    Parallelogram.prototype.drawFigure = function (fillFlag) {
        ctx.beginPath();
        ctx.moveTo(this.A.x, this.A.y);
        ctx.lineTo(this.B.x, this.B.y);
        ctx.lineTo(this.C.x, this.C.y);
        ctx.lineTo(this.D.x, this.D.y);
        ctx.lineTo(this.A.x, this.A.y);
        var colorStr = COLOR[this.color];
        ctx.lineWidth = 1;
        ctx.strokeStyle = colorStr;
        ctx.stroke();
    };
    return Parallelogram;
}(Figure));
//# sourceMappingURL=app.js.map