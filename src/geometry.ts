export function isPointInCircle(
    mouseX: number,
    mouseY: number,
    circleX: number,
    circleY: number,
    radius:  number): boolean {
    // Calculate the distance between the mouse and the circle center
    const distance = Math.sqrt((mouseX - circleX) ** 2 + (mouseY - circleY) ** 2);

    // Return true if the distance is less than or equal to the radius
    return distance <= radius;
}

export function isPointOnLine(
    pointX: number,
    pointY: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    tolerance = 5): boolean {

    function distance(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // Compute the projection of (mouseX, mouseY) onto the line segment
    const lengthSquared = distance(x1, y1, x2, y2) ** 2;
    if (lengthSquared === 0) return distance(pointX, pointY, x1, y1) <= tolerance;

    let t = ((pointX - x1) * (x2 - x1) + (pointY - y1) * (y2 - y1)) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * (x2 - x1);
    const closestY = y1 + t * (y2 - y1);

    return distance(pointX, pointY, closestX, closestY) <= tolerance;
}

export function getLineIntersection(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number): { x: number, y: number } | null {
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
        return null; // Lines are parallel or coincident
    }

    const intersectX = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denominator;
    const intersectY = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denominator;

    // Check if the intersection point is within both line segments
    if (
        isPointOnLine(intersectX, intersectY, x1, y1, x2, y2) &&
        isPointOnLine(intersectX, intersectY, x3, y3, x4, y4)
    ) {
        return { x: intersectX, y: intersectY };
    }

    return null; // Intersection is outside the given line segments
}

export function slope(x1: number, y1: number, x2: number, y2: number) {
    const rise = y2 - y1;
    const run = x2 - x1;
    return {
        rise,
        run
    }
}