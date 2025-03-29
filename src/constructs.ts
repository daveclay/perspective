import {getLineIntersection, isMouseInCircle, isMouseOnLine} from "./geometry.ts";

export interface Construct {
    draw(ctx: CanvasRenderingContext2D): void;
    moveBy(dx: number, dy: number): void;
    isTarget(mouseX: number, mouseY: number): boolean;
}

export interface Position {
    getX(): number;
    getY(): number;
    moveBy(dx: number, dy: number): void;
}

export class AbsolutePosition implements Position {
    constructor(private x: number | null,
                private y: number | null) {}

    getX(): number {
        return this.x || 0;
    }

    getY(): number {
        return this.y || 0;
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
    constructor(public getX: () => number, public getY: () => number) {
    }

    moveBy(_dx: number, _dy: number) {
    }
}

export class ReferencePointPosition implements Position {
    constructor(private originalPoint: Point) {}

    getX() {
        return this.originalPoint.getX();
    }

    getY() {
        return this.originalPoint.getY();
    }

    moveBy(_dx: number, _dy: number) {
    }
}

export class Point implements Construct {

    private radius = 10;
    private offsetPosition: Position | null = null;

    constructor(public name: string,
                private position: Position,
                private color: string,
                offsetPosition?: Position) {
        this.offsetPosition = offsetPosition || null;
    }

    getX() {
        return this.position.getX() + this.getOffsetX();
    }

    getY() {
        return this.position.getY() + this.getOffsetY();
    }

    getOffsetX() {
        return this.offsetPosition ? this.offsetPosition.getX() : 0;
    }

    getOffsetY() {
        return this.offsetPosition ? this.offsetPosition.getY() : 0;
    }

    getPosition() {
        return new ReferencePointPosition(this);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.moveTo(this.getX(), this.getY());
        ctx.fillStyle = this.color;
        ctx.arc(this.getX(), this.getY(), this.radius, 0, Math.PI * 2, true);
        ctx.fill();
    }

    isTarget(mouseX: number, mouseY: number): boolean {
        return isMouseInCircle(mouseX, mouseY, this.position.getX(), this.position.getY(), this.radius);
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
    constructor(
        public name: string,
        private startPoint: Point,
        private endPoint: Point,
        private color: string) {}

    draw(ctx: CanvasRenderingContext2D) {
        ctx.moveTo(this.startPoint.getX(), this.startPoint.getY());
        ctx.lineTo(this.endPoint.getX(), this.endPoint.getY());
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }

    isTarget(mouseX: number, mouseY: number) {
        return isMouseOnLine(
            mouseX,
            mouseY,
            this.startPoint.getX(),
            this.startPoint.getY(),
            this.endPoint.getX(),
            this.endPoint.getY()
        )
    }

    moveBy(dx: number, dy: number) {
        this.startPoint.moveBy(dx, dy);
        this.endPoint.moveBy(dx, dy)
    }

    intersectionTo(otherLine: Line): Position | null {
        const calculatePosition = () => {
            const coords = getLineIntersection(
                this.startPoint.getX(),
                this.startPoint.getY(),
                this.endPoint.getX(),
                this.endPoint.getY(),
                otherLine.startPoint.getX(),
                otherLine.startPoint.getY(),
                otherLine.endPoint.getX(),
                otherLine.endPoint.getY(),
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

        return new RelativePosition(
            () => {
                return calculatePosition().x;
            },
            () => {
                return calculatePosition().y
            });
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
