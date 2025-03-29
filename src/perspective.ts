import {AbsolutePosition, fromPoint, Group, Line, Point, RelativePosition} from "./constructs.ts";
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
const firstArtLineEndPoint = new Point("firstArtLineEndPoint", new AbsolutePosition(658, 851), "black");
const firstArtLine = new Line("firstArtLine", firstArtLineStartPont, firstArtLineEndPoint, "black")

const firstArtMark = new Group([
    firstArtLineStartPont,
    firstArtLineEndPoint,
    firstArtLine
])

const secondArtLineStartPont = fromPoint(leftHorizonVanishingPoint).named("secondArtLineStartPont").color("black").toPoint();
const secondArtLineEndPont = new Point("secondArtLineEndPont", new AbsolutePosition(1097, 848), "black");
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

/**
 * Build the point and line at which the given line intersects the vertical reference line
 */
function buildVerticalArtLineIntersection(artLine: Line): {
    artLineIntersectionPoint: Point,
    artLineIntersectionLine: Line
} {
    const artLineIntersectionPoint = new Point(
        `${artLine.name}VerticalReferenceIntersectionPoint`,
        artLine.intersectionTo(verticalReferenceLine) || new AbsolutePosition(0, 0),
        "gray");

    const artLineIntersectionLineStartPoint = fromPoint(artLineIntersectionPoint)
        .offsetX(-400)
        .named(`${artLine.name}VerticalReferenceIntersectionLineStartPoint`)
        .color("gray")
        .toPoint()

    const artLineIntersectionLineEndPoint = fromPoint(artLineIntersectionPoint)
        .offsetX(400)
        .named(`${artLine.name}VerticalReferenceIntersectionLineEndPoint`)
        .color("gray")
        .toPoint()

    const artLineIntersectionLine = new Line(
        `${artLine.name}VerticalReferenceIntersectionLine`,
        artLineIntersectionLineStartPoint,
        artLineIntersectionLineEndPoint,
        "gray");

    return {
        artLineIntersectionPoint,
        artLineIntersectionLine
    }
}

const {
    artLineIntersectionPoint: firstArtLineVerticalReferenceIntersectionPoint,
    artLineIntersectionLine: firstArtLineVerticalReferenceIntersectionLine
} = buildVerticalArtLineIntersection(firstArtLine);

const {
    artLineIntersectionPoint: secondArtLineVerticalReferenceIntersectionPoint,
    artLineIntersectionLine: secondArtLineVerticalReferenceIntersectionLine
} = buildVerticalArtLineIntersection(secondArtLine);


// TODO: this will end up being a function given the art line
const secondPerspectivePoint = fromPoint(leftHorizonVanishingPoint)
    .named("secondPerspectivePoint")
    .offsetX(1000)
    .color("#ff8855")
    .toPoint()

const firstArtLineToSecondPerspectivePoint = new Line(
    "firstArtLineToSecondPerspectivePoint",
    firstArtLineVerticalReferenceIntersectionPoint,
    secondPerspectivePoint,
    "#ff8855"
)

const firstArtLineSecondPerspectivePoint = new Point(
    "firstArtLineSecondPerspectivePoint",
    // TODO: this is glitching
    firstArtLineToSecondPerspectivePoint.intersectionTo(secondArtLineVerticalReferenceIntersectionLine)!,
    "#ff8855"
);

export const constructsToDraw = [
    horizon,
    firstArtMark,
    secondArtMark,
    verticalReferenceLine,
    testPoint,
    firstArtLineVerticalReferenceIntersectionPoint,
    firstArtLineVerticalReferenceIntersectionLine,
    secondArtLineVerticalReferenceIntersectionPoint,
    secondArtLineVerticalReferenceIntersectionLine,
    secondPerspectivePoint,
    firstArtLineToSecondPerspectivePoint,
    firstArtLineSecondPerspectivePoint
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
