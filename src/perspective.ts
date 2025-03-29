import {AbsolutePosition, fromPoint, Group, Line, Point } from "./constructs.ts";
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
    artLineToVerticalRefIntersectionPoint: Point,
    artLineToVerticalRefIntersectionLine: Line
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
        artLineToVerticalRefIntersectionPoint: artLineIntersectionPoint,
        artLineToVerticalRefIntersectionLine: artLineIntersectionLine
    }
}

const {
    artLineToVerticalRefIntersectionPoint: firstArtLineVerticalReferenceIntersectionPoint,
    artLineToVerticalRefIntersectionLine: firstArtLineVerticalReferenceIntersectionLine
} = buildVerticalArtLineIntersection(firstArtLine);

const {
    artLineToVerticalRefIntersectionPoint: secondArtLineVerticalReferenceIntersectionPoint,
    artLineToVerticalRefIntersectionLine: secondArtLineVerticalReferenceIntersectionLine
} = buildVerticalArtLineIntersection(secondArtLine);


const secondPerspectivePoint = fromPoint(leftHorizonVanishingPoint)
    .named("secondPerspectivePoint")
    .offsetX(1000)
    .color("#ff8855")
    .toPoint()

const firstArtLineToSecondPerspectivePoint = new Line(
    "firstArtLineToSecondPerspectivePointLine",
    firstArtLineVerticalReferenceIntersectionPoint,
    secondPerspectivePoint,
    "#ff8855"
)

const firstArtLineSecondPerspectivePoint = new Point(
    "firstArtLineSecondPerspectivePoint",
    firstArtLineToSecondPerspectivePoint.intersectionTo(secondArtLineVerticalReferenceIntersectionLine)!,
    "#ff8855"
);

const verticalRefPointToFirstArtLineSecondPerspectiveLine = new Line(
    "verticalRefPointToFirstArtLineSecondPerspectiveLine",
    verticalReferencePoint,
    firstArtLineSecondPerspectivePoint,
    "#ff8855"
)

function buildSecondPerspectivePointReferenceLines(fromArtLineVerticalRefIntersectionPoint: Point) {
    const toSecondPerspectivePointLine = new Line("to second perspective point",
        fromArtLineVerticalRefIntersectionPoint,
        secondPerspectivePoint,
        "blue");

    const secondPerspectiveIntersectionPoint = toSecondPerspectivePointLine.intersectionTo(verticalRefPointToFirstArtLineSecondPerspectiveLine)!;
    const nextArtLineHorizontalRefPoint = new Point(
        "nextArtLineHorizontalRefPoint",
        secondPerspectiveIntersectionPoint,
        "blue"
    );

    const nextArtLineToVerticalRefPoint = new Line(
        "nextArtLineToVerticalRefPoint",
        nextArtLineHorizontalRefPoint,
        fromPoint(nextArtLineHorizontalRefPoint).offsetX(-400).color("gray").toPoint(),
        "gray"
    )

    return {
        toSecondPerspectivePointLine,
        nextArtLineHorizontalRefPoint,
        nextArtLineToVerticalRefPoint,
    }
}

const {
    toSecondPerspectivePointLine,
    nextArtLineHorizontalRefPoint,
    nextArtLineToVerticalRefPoint,
} = buildSecondPerspectivePointReferenceLines(secondArtLineVerticalReferenceIntersectionPoint);

export const constructsToDraw = [
    horizon,
    firstArtMark,
    secondArtMark,
    verticalReferencePoint,
    verticalReferenceLine,
    testPoint,
    firstArtLineVerticalReferenceIntersectionPoint,
    firstArtLineVerticalReferenceIntersectionLine,
    secondArtLineVerticalReferenceIntersectionPoint,
    secondArtLineVerticalReferenceIntersectionLine,
    secondPerspectivePoint,
    firstArtLineToSecondPerspectivePoint,
    firstArtLineSecondPerspectivePoint,
    verticalRefPointToFirstArtLineSecondPerspectiveLine,
    toSecondPerspectivePointLine,
    nextArtLineHorizontalRefPoint,
    nextArtLineToVerticalRefPoint,

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
