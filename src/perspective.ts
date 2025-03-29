import {AbsolutePosition, fromPoint, Group, Line, Point} from "./constructs.ts";
import interaction from "./interaction.ts";

const leftHorizonVanishingPoint = new Point("leftHorizonVanishingPoint", new AbsolutePosition(20, 100), "red");
const rightHorizonVanishingPoint = fromPoint(leftHorizonVanishingPoint)
    .named("rightHorizonVanishingPoint")
    .offsetX(1400)
    .color("red")
    .toPoint();
const horizonLine = new Line("horizonLine", leftHorizonVanishingPoint, rightHorizonVanishingPoint, "red");

const horizon = new Group([
    leftHorizonVanishingPoint,
    rightHorizonVanishingPoint,
    horizonLine
])

const firstArtLineStartPont = fromPoint(leftHorizonVanishingPoint).named("firstArtLineStartPont").color("black").toPoint();
const firstArtLineEndPoint = new Point("firstArtLineEndPoint", new AbsolutePosition(1097, 848), "black");
const firstArtLine = new Line("firstArtLine", firstArtLineStartPont, firstArtLineEndPoint, "black")

const firstArtMark = new Group([
    firstArtLineStartPont,
    firstArtLineEndPoint,
    firstArtLine
])

const secondArtLineStartPont = fromPoint(leftHorizonVanishingPoint).named("secondArtLineStartPont").color("black").toPoint();
const secondArtLineEndPont = new Point("secondArtLineEndPont", new AbsolutePosition(658, 851), "black");
const secondArtLine = new Line("secondArtLine", secondArtLineStartPont, secondArtLineEndPont, "black")

const secondArtMark = new Group([
    secondArtLineStartPont,
    secondArtLineEndPont,
    secondArtLine
])

const verticalReferencePoint = fromPoint(leftHorizonVanishingPoint)
    .offsetX(600)
    .named("verticalReferencePoint")
    .color("orange")
    .toPoint();

const verticalReferenceEndPoint = fromPoint(verticalReferencePoint)
    .offsetY(800)
    .named("verticalReferenceEndPoint")
    .color("orange")
    .toPoint();

const verticalReferenceLine = new Line("verticalReferenceLine", verticalReferencePoint, verticalReferenceEndPoint, "orange");

const testPoint = new Point("test", new AbsolutePosition(80, 45), "blue");

const firstArtLineIntersectionPoint = new Point(
    "firstArtLineIntersectionPoint",
    firstArtLine.intersectionTo(verticalReferenceLine) || new AbsolutePosition(0, 0),
    "gray");

const firstArtLineIntersectionLineStartPoint = fromPoint(firstArtLineIntersectionPoint)
    .offsetX(-400)
    .named("firstArtLineIntersectionLineStartPoint")
    .color("gray")
    .toPoint()

const secondArtLineIntersectionLineStartPoint = fromPoint(firstArtLineIntersectionPoint)
    .offsetX(400)
    .named("secondArtLineIntersectionLineStartPoint")
    .color("gray")
    .toPoint()

const firstArtLineIntersectionLine = new Line(
    "firstArtLineIntersectionLine",
    firstArtLineIntersectionLineStartPoint,
    secondArtLineIntersectionLineStartPoint,
    "gray");



export const constructsToDraw = [
    horizon,
    firstArtMark,
    secondArtMark,
    verticalReferenceLine,
    testPoint,
    firstArtLineIntersectionPoint,
    firstArtLineIntersectionLine
];

export function draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, 3000, 3000);

    for (const thingToDraw of constructsToDraw) {
        ctx.beginPath();
        thingToDraw.draw(ctx);
    }

    ctx.font = "12px serif";
    ctx.fillStyle = "black";
    ctx.fillText(`${interaction.mouseX}, ${interaction.mouseY}`, 10, 50);

    window.requestAnimationFrame(() => {
        draw(ctx);
    });
}
