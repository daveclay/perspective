import {Construct} from "./constructs.ts";
import {constructsToDraw} from "./perspective.ts";

export class InteractionData {
    public selectedConstruct: Construct | null = null;
    public startMouseX = 0;
    public startMouseY = 0;
    public mouseX = 0;
    public mouseY = 0;

    setupInteraction(canvas: HTMLCanvasElement) {
        canvas.addEventListener("mousedown", (e) => {
            this.startMouseX = e.pageX;
            this.startMouseY = e.pageY;
            this.selectedConstruct = this.findTargetThing(this.startMouseX, this.startMouseY);
            console.log(this.selectedConstruct);
        });

        canvas.addEventListener("mouseup", () => {
            this.selectedConstruct = null;
            this.startMouseX = 0;
            this.startMouseY = 0;
        });

        canvas.addEventListener("mousemove", (e) => {
            this.mouseX = e.pageX;
            this.mouseY = e.pageY;
            let mouseDistanceX = this.mouseX - this.startMouseX;
            let mouseDistanceY = this.mouseY - this.startMouseY;
            this.startMouseX = this.mouseX;
            this.startMouseY = this.mouseY;
            if (this.selectedConstruct) {
                this.selectedConstruct.moveBy(mouseDistanceX, mouseDistanceY);
            }
        });

        canvas.addEventListener("mouseout", () => {
            this.selectedConstruct = null;
        });
    }

    findTargetThing(mouseX: number, mouseY: number): Construct | null {
        for (const construct of constructsToDraw) {
            if (construct.isTarget(mouseX, mouseY)) {
                return construct;
            }
        }

        return null;
    }
}

export default new InteractionData();