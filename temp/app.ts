/// <reference path="scripts/typings/jquery/jquery.d.ts" />

let drag: boolean = false;
let i: number = 0;

let canvas: HTMLCanvasElement;
const CANVAS_WIDTH: number = 1100;
const CANVAS_HEIGHT: number = 500;

let ctx;
let $canvas = $("#canvas");
let offsetX: number;
let offsetY: number;

let numberOfCircles: number = 3;
let circlesMass: Circle[] = [];
let radiusNumber: number = 10;

let isDown: boolean = false;
let lastX: number;
let lastY: number;

let draggingCircle: Circle;
let parallelogram: Parallelogram;

window.onload = function () {
    canvas = <HTMLCanvasElement>document.getElementById("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx = canvas.getContext("2d");

    let canvasOffset = $canvas.offset();
    offsetX = canvasOffset.left;
    offsetY = canvasOffset.top;
}

function PutAPoint(event): void {
    if (circlesMass.length < numberOfCircles) {
        let point: Point = getCursorPosition(canvas, event);

        if (checkIfPointCircleIsOnCanvas(point, radiusNumber)) {

            let circlePoint: Circle = getCircle(point, radiusNumber);

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

function setCoordinatesLabels(circlesMass: Circle[]): void {
    for (var i = 0; i < circlesMass.length; i++) {
        let str: string = "";
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

function setAreaLabel(parallelogram: Parallelogram): void {
    ctx.beginPath();
    let str: string = "Area: " + parallelogram.Area.toFixed(2);
    ctx.fillText(str, parallelogram.CenterOfMass.x - 60, parallelogram.CenterOfMass.y);
}

function clearField(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circlesMass = [];
    $("#reset").css("visibility", "hidden");
}

function redrawingCircles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getCursorPosition(canvas, event): Point {
    let x = event.clientX;
    let y = event.clientY;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return new Point(x, y);
}

function getCircle(point: Point, radius: number): Circle {
    return new Circle(COLOR.RED, point, radius);
}

function checkIfPointCircleIsOnCanvas(point: Point, radius: number): boolean {
    return (point.x - radius > 0 && point.x + radius < CANVAS_WIDTH && point.y - radius > 0 && point.y + radius < CANVAS_HEIGHT) ? true : false;
}
let hit = -1;
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
})

$canvas.mousemove(function () {
    if (!drag) {
        return;
    }

    if (isDown && hit != -1) {
        var currentCursorPosition: Point = getCursorPosition(canvas, event);

        if (checkIfPointCircleIsOnCanvas(currentCursorPosition, radiusNumber)) {

            let dx = currentCursorPosition.x - lastX;
            let dy = currentCursorPosition.y - lastY;

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
})

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
class Point {
    public x: number;
    public y: number;
    //public name: enum -- (names of points - A, B, C)

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

abstract class Figure {
    public color: COLOR;

    constructor(color: COLOR) {
        this.color = color;
    }

    public abstract drawFigure(fillFlag?: boolean): void;
}

enum COLOR { RED, BLUE, ORANGE };

class Circle extends Figure {
    public centerPoint: Point;
    public radius: number;
    public static readonly pi2: number = 2 * Math.PI;
    public static readonly pi: number = Math.PI;

    constructor(color: COLOR, centerPoint: Point, radius: number) {
        super(color);
        this.centerPoint = centerPoint;
        this.radius = radius;
    }
    public drawFigure(fillFlag: boolean): void {
        ctx.beginPath();
        ctx.arc(this.centerPoint.x, this.centerPoint.y, this.radius, 0, Circle.pi2, false);

        let color = this.color;
        let colorStr = COLOR[color];

        if (fillFlag) {
            ctx.fillStyle = colorStr;
            ctx.fill();
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = colorStr;
        ctx.stroke();
    }
}

class Parallelogram extends Figure {
    public A: Point;
    public B: Point;
    public C: Point;
    public D: Point;
    public CenterOfMass: Point;
    public circleInParall: Circle;
    public Area: number;

    constructor(color: COLOR, A: Point, B: Point, C: Point) {
        super(color);
        this.A = A;
        this.B = B;
        this.C = C;

        this.setTheFourthPoint();

        this.drawFigure();

        this.setArea();

        this.circleInParall = new Circle(COLOR.ORANGE, this.CenterOfMass, this.getRadiusByArea());
        this.circleInParall.drawFigure(false);
    }

    getRadiusByArea(): number {
        return Math.sqrt(this.Area / Circle.pi);
    }

    setArea(): void {
        let a: number;
        let b: number;

        a = this.getLineLengthByTwoPoints(this.A, this.B);
        b = this.getLineLengthByTwoPoints(this.B, this.C);

        let cosA: number;
        let sinA: number;

        cosA = ((this.B.x - this.A.x) * (this.B.y - this.A.y) + (this.B.x - this.C.x) * (this.B.y - this.C.y)) / (a * b);

        sinA = Math.sqrt(1 - Math.pow(cosA, 2));

        this.Area = a * b * sinA;
    }

    setTheFourthPoint(): void {
        let Xd: number = (this.A.x + this.C.x) / 2;
        let Yd: number = (this.A.y + this.C.y) / 2;

        this.CenterOfMass = new Point(Xd, Yd);

        Xd = 2 * Xd - this.B.x;
        Yd = 2 * Yd - this.B.y;
        this.D = new Point(Xd, Yd);

    }

    getLineLengthByTwoPoints(A: Point, B: Point): number {
        return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    }

    public drawFigure(fillFlag?: boolean): void {
        ctx.beginPath();
        ctx.moveTo(this.A.x, this.A.y);
        ctx.lineTo(this.B.x, this.B.y);
        ctx.lineTo(this.C.x, this.C.y);
        ctx.lineTo(this.D.x, this.D.y);
        ctx.lineTo(this.A.x, this.A.y);

        let colorStr = COLOR[this.color];
        ctx.lineWidth = 1;
        ctx.strokeStyle = colorStr;
        ctx.stroke();
    }
}
