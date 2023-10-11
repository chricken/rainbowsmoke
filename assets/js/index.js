'use strict';

import settings, {elements} from './settings.js';
import RainbowSmoke from './rainbow_smoke.js';
import helpers, {rnd} from './helpers.js';

// FUNKTIONEN
const domMapping = () => {
    elements.c = document.querySelector('canvas');
    elements.ctx = elements.c.getContext('2d');
}

const initCanvas = () => {
    elements.c.width = settings.size.x;
    elements.c.height = settings.size.y;
}

const init = () => {
    domMapping();
    initCanvas();
    let smoke = new RainbowSmoke();
    elements.c.addEventListener('click', smoke.update);
    // let findMe = [rnd(0,255),rnd(0,255),rnd(0,255)]
    // smoke.findNearestColor(findMe);
}

// INIT
init();