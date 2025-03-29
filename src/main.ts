import './style.css'

import interaction from "./interaction.ts";
import {draw} from "./perspective.ts";

function setup() {
    const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    if (!canvas.getContext) {
        return;
    }

    interaction.setupInteraction(canvas);

    const ctx = canvas.getContext("2d")!;
    window.requestAnimationFrame(() => {
        draw(ctx);
    });
}

setup();
