import './style.css'

function draw(ctx) {
}

let selectedThing: unknown = null;
let startMouseX = 0;
let startMouseY = 0;
let mouseX = 0;
let mouseY = 0;

function setup() {
    const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    if (!canvas.getContext) {
        return;
    }

    canvas.addEventListener("mousedown", (e) => {
        startMouseX = e.pageX;
        startMouseY = e.pageY;
        selectedThing = findTargetThing(startMouseX, startMouseY);
        console.log(selectedThing);
    });

    canvas.addEventListener("mouseup", (e) => {
        selectedThing = undefined;
        startMouseX = 0;
        startMouseY = 0;
    });

    canvas.addEventListener("mousemove", (e) => {
        mouseX = e.pageX;
        mouseY = e.pageY;
        let mouseDistanceX = mouseX - startMouseX;
        let mouseDistanceY = mouseY - startMouseY;
        startMouseX = mouseX;
        startMouseY = mouseY;
        if (selectedThing) {
            selectedThing.moveBy(mouseDistanceX, mouseDistanceY);
        }
    });

    canvas.addEventListener("mouseout", (e) => {
        selectedThing = undefined;
    });

    const ctx = canvas.getContext("2d");
    window.requestAnimationFrame(() => {
        draw(ctx);
    });
}

setup();
