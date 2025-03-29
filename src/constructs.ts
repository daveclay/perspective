import {Coords, getLineIntersection, isPointInCircle, isPointOnLine } from "./geometry.ts";

export interface Calculable {
    getCoords(tick: number): Coords;
}

export interface Construct {
    draw(ctx: CanvasRenderingContext2D, tick: number): void;
    moveBy(dx: number, dy: number): void;
    isTarget(mouseX: number, mouseY: number): boolean;
}

export interface Position extends Calculable {
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

class CoordCache {
    private lastTick: number = -1;
    private lastCoords: Coords = { x: -1, y: -1 };

    withCaching(tick: number, calculateCoords: (tick: number) => Coords): Coords {
        if (this.lastTick != tick) {
            this.lastCoords = calculateCoords(tick);
            this.lastTick = tick;
        }

        return this.lastCoords;
    }
}

export class RelativePosition implements Position {
    private coordCache = new CoordCache();
    constructor(private calculateCoords: (tick: number) => Coords) {
    }

    public getCoords(tick: number): Coords {
        return this.coordCache.withCaching(tick, (tick) => this.calculateCoords(tick));
    }

    moveBy(_dx: number, _dy: number) {
    }
}

export class Point implements Construct {
    private radius = 10;
    private offsetPosition: Position | null = null;
    private lastCoords: Coords = { x: -1, y: -1 };
    private coordCache = new CoordCache();

    constructor(public name: string,
                private position: Position,
                private color: string,
                offsetPosition?: Position) {
        this.offsetPosition = offsetPosition || null;
    }

    getPosition() {
        return new RelativePosition((tick: number) => this.calculateCoords(tick));
    }

    calculateCoords(tick: number) {
        const positionCoords = this.position.getCoords(tick);
        const offsetCoords = this.offsetPosition?.getCoords(tick);

        return {
            x: positionCoords.x + (offsetCoords?.x || 0),
            y: positionCoords.y + (offsetCoords?.y || 0)
        }
    }

    getCoords(tick: number): Coords {
        return this.coordCache.withCaching(tick, () => {
            return this.calculateCoords(tick);
        });
    }

    draw(ctx: CanvasRenderingContext2D, tick: number) {
        const coords = this.getCoords(tick);
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

    draw(ctx: CanvasRenderingContext2D, tick: number) {
        const startPointCoords = this.startPoint.getCoords(tick);
        const endPointCoords = this.endPoint.getCoords(tick);

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
        const calculatePosition = (tick: number) => {
            const coords = getLineIntersection(
                {
                    start: this.startPoint.getCoords(tick),
                    end: this.endPoint.getCoords(tick)
                },
                {
                    start: otherLine.startPoint.getCoords(tick),
                    end: otherLine.endPoint.getCoords(tick)
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

    draw(ctx: CanvasRenderingContext2D, tick: number) {
        for (const construct of this.constructs) {
            construct.draw(ctx, tick);
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
