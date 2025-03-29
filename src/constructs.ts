import {Coords, getLineIntersection, isPointInCircle, isPointOnLine } from "./geometry.ts";

export interface Construct {
    draw(ctx: CanvasRenderingContext2D): void;
    moveBy(dx: number, dy: number): void;
    isTarget(mouseX: number, mouseY: number): boolean;
}

export interface Position {
    getCoords(): Coords;
    moveBy(dx: number, dy: number): void;
}

export class AbsolutePosition implements Position {
    constructor(private x: number | null,
                private y: number | null) {}

    getCoords(): Coords {
        return {
            x: this.x || 0,
            y: this.y || 0
        }
    }

    moveBy(dx: number, dy: number) {
        if (this.x) {
            this.x += dx;
        }

        if (this.y) {
            this.y += dy;
        }
    }
}

export class RelativePosition implements Position {
    constructor(public getCoords: () => Coords) {
    }


    moveBy(_dx: number, _dy: number) {
    }
}

export class Point implements Construct {

    private radius = 10;
    private offsetPosition: Position | null = null;
    private lastCoords: Coords = { x: -1, y: -1 };

    constructor(public name: string,
                private position: Position,
                private color: string,
                offsetPosition?: Position) {
        this.offsetPosition = offsetPosition || null;
    }

    getPosition() {
        return new RelativePosition(() => this.getCoords());
    }

    getCoords(): Coords {
        const positionCoords = this.position.getCoords();
        const offsetCoords = this.offsetPosition?.getCoords();

        return {
            x: positionCoords.x + (offsetCoords?.x || 0),
            y: positionCoords.y + (offsetCoords?.y || 0)
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const coords = this.getCoords();
        // store em for the isTarget check
        this.lastCoords = coords;

        ctx.moveTo(coords.x, coords.y);
        ctx.fillStyle = this.color;
        ctx.arc(coords.x, coords.y, this.radius, 0, Math.PI * 2, true);
        ctx.fill();

        ctx.font = "10px serif";
        ctx.fillStyle = "black";
        ctx.fillText(this.name, coords.x + 20, coords.y - 20);

    }

    isTarget(mouseX: number, mouseY: number): boolean {
        return isPointInCircle(mouseX, mouseY, this.lastCoords.x, this.lastCoords.y, this.radius);
    }

    moveBy(dx: number, dy: number) {
        if (this.offsetPosition) {
            this.offsetPosition.moveBy(dx, dy);
        } else {
            this.position.moveBy(dx, dy);
        }
    }
}

export class ReferencePointBuilder {
    private _name: string | null = null;
    private _color: string | null = null;
    private _offsetX: number | null = null;
    private _offsetY: number | null = null;

    constructor(private originalPoint: Point) {
    }

    named(name: string) {
        this._name = name;
        return this;
    }

    color(color: string) {
        this._color = color;
        return this;
    }

    offsetX(distance: number) {
        this._offsetX = distance;
        return this;
    }

    offsetY(distance: number) {
        this._offsetY = distance;
        return this;
    }

    toPoint(): Point {
        return new Point(
            this._name!,
            this.originalPoint.getPosition(),
            this._color!,
            new AbsolutePosition(this._offsetX, this._offsetY),
        );
    }
}

export function fromPoint(point: Point) {
    return new ReferencePointBuilder(point);
}

export class Line implements Construct {
    private lastStartPointCoords: Coords = { x: -1, y: -1 };
    private lastEndPointCoords: Coords = { x: -1, y: -1 };

    constructor(
        public name: string,
        private startPoint: Point,
        private endPoint: Point,
        private color: string) {}

    draw(ctx: CanvasRenderingContext2D) {
        const startPointCoords = this.startPoint.getCoords();
        const endPointCoords = this.endPoint.getCoords();

        this.lastStartPointCoords = startPointCoords;
        this.lastEndPointCoords = endPointCoords;

        ctx.moveTo(startPointCoords.x, startPointCoords.y);
        ctx.lineTo(endPointCoords.x, endPointCoords.y);
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }

    isTarget(mouseX: number, mouseY: number) {
        return isPointOnLine(
            mouseX,
            mouseY,
            this.lastStartPointCoords.x,
            this.lastStartPointCoords.y,
            this.lastEndPointCoords.x,
            this.lastEndPointCoords.y
        )
    }

    moveBy(dx: number, dy: number) {
        this.startPoint.moveBy(dx, dy);
        this.endPoint.moveBy(dx, dy)
    }

    intersectionTo(otherLine: Line): Position | null {
        const calculatePosition = () => {
            const coords = getLineIntersection(
                {
                    start: this.startPoint.getCoords(),
                    end: this.endPoint.getCoords()
                },
                {
                    start: otherLine.startPoint.getCoords(),
                    end: otherLine.endPoint.getCoords()
                }
            );

            if (coords) {
                return coords;
            } else {
                return {
                    x: -1,
                    y: -1
                }
            }
        }

        return new RelativePosition(calculatePosition);
    }
}

export class Group implements Construct {
    constructor(private constructs: Construct[]) {}

    draw(ctx: CanvasRenderingContext2D) {
        for (const construct of this.constructs) {
            construct.draw(ctx);
        }
    }

    isTarget(mouseX: number, mouseY: number) {
        for (const construct of this.constructs) {
            if (construct.isTarget(mouseX, mouseY)) {
                return true;
            }
        }

        return false;
    }

    moveBy(dx: number, dy: number) {
        // remember we're moving relative.
        for (const construct of this.constructs) {
            construct.moveBy(dx, dy);
        }
    }
}
