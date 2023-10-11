'use strict';

import settings, { elements } from './settings.js';
import helpers, { rnd } from './helpers.js';

class RainbowSmoke {
    constructor() {

        this.fillPxTable();

        this.fillColorTable();

        // StartPixel auf einen zufälligen Wert setzen
        this.startPixel = {
            x: rnd(0, settings.size.x),
            y: rnd(0, settings.size.y),
        }

        this.pxTable[this.startPixel.y][this.startPixel.x] = [
            rnd(0,255),
            rnd(0,255),
            rnd(0,255),
        ];
        console.log(this.startPixel.x, this.startPixel.y);

        // Nächsten 
        // Alles binden
        /*
        this.fillPxTable.bind(this)
        this.fillColorTable.bind(this)
        this.findNearestColor.bind(this)
        this.findNextPixel.bind(this)
        this.render.bind(this)
        this.findEnvColor.bind(this)
        this.calcDistance.bind(this)
        this.update.bind(this)
        */
        this.iterate(20);
    }

    // Array für die Pixel vorbereiten
    fillPxTable() {
        // 2-Dimensionales Array mit den Pixeln des Canvas
        // In diesem Array wird beim Rendern die null durch Farben überschrieben
        // Diese Farben werden beim Rendern in Farben umgesetzt
        this.pxTable = [];
        for (let y = 0; y < settings.size.y; y++) {
            this.pxTable.push([])
            for (let x = 0; x < settings.size.x; x++) {
                this.pxTable[y].push(null);
            }
        }
    }

    // Farbtabelle füllen
    fillColorTable() {
        let numAllColors = 256 ** 3;
        let numPx = settings.size.x * settings.size.y;
        let colorInkrement = numAllColors / numPx;

        this.colorTable = [];
        // Schleife, die für jeden Pixel eine Farbe in ein Array schreibt
        // Die Farben sind gleichmäßig über das 8bit-RGB-Farbsystem verteilt
        for (let i = 0; i < numAllColors; i += colorInkrement) {
            let color = Math.round(i).toString(16);
            color = helpers.leading0(color, 6);
            let r = color[0] + color[1];
            let g = color[2] + color[3];
            let b = color[4] + color[5];
            r = parseInt(r, 16);
            g = parseInt(g, 16);
            b = parseInt(b, 16);
            this.colorTable.push([r, g, b]);
        }
        console.log(this.colorTable);

    }

    // Aus dem Colortable die ähnlichste Farbe finden und diese aus dem Colortable entfernen
    findNearestColor(color = [0, 0, 0]) {
        let nearestColors = {
            distance: Infinity,
            colors: []
        }
        // console.log(this.colorTable);
        for (let i = 0; i < this.colorTable.length; i++) {
            let tableColor = this.colorTable[i];
            let distance = this.calcDistance(color, tableColor);

            if (distance == nearestColors.distance) {
                // Wenn diese Farbe so gleich ist wie die aktuell gleichste Farbe, dann hänge diese Farbe in das Array
                nearestColors.colors.push({
                    index: i,
                    color: tableColor
                })
            } else if (distance < nearestColors.distance) {
                // Wenn diese Farbe gleicher ist als die bisher gleichste, ersetze jene durch diese
                nearestColors = {
                    distance,
                    colors: [{
                        index: i,
                        color: tableColor
                    }]
                }
            }
        }
        // Aus den Farben eine zufällige Farbe wählen
        let col = nearestColors.colors;
        // console.log(nearestColors);
        // console.log(col);
        let index = helpers.createNumber(0, col.length - 1);
        col = {
            distance: nearestColors.distance,
            color: col[index]
        };
        this.colorTable.splice(col.color.index, 1);
        return col;

    }

    // nächsten zu rendernden Pixel finden
    findNextPixel() {
        let nearestPx = {
            distance: Infinity,
        }

        // pxTable iterieren
        for (let y = 0; y < this.pxTable.length; y++) {
            for (let x = 0; x < this.pxTable[y].length; x++) {
                // Schon gefüllte Pixel überspringen
                if (this.pxTable[y][x] == null) {
                    let distance = helpers.pythagorasPoints(
                        { x, y },
                        this.startPixel
                    )
                    if (distance < nearestPx.distance) {
                        nearestPx = { distance, x, y }
                    }
                    // console.log(x, y, distance);
                }
            }
        }
        return nearestPx;
    }

    // Übertragen des pxTables in das Canvas
    render() {
        let imgData = elements.ctx.getImageData(0, 0, settings.size.x, settings.size.y);
        for (let y = 0; y < this.pxTable.length; y++) {
            for (let x = 0; x < this.pxTable[y].length; x++) {
                if (this.pxTable[y][x]) {
                    // Aus den Imagedaten den richtigen Pixel nehmen und färben
                    imgData.data[((y * settings.size.x) + x) * 4] = this.pxTable[y][x][0];
                    imgData.data[((y * settings.size.x) + x) * 4 + 1] = this.pxTable[y][x][1];
                    imgData.data[((y * settings.size.x) + x) * 4 + 2] = this.pxTable[y][x][2];
                    imgData.data[((y * settings.size.x) + x) * 4 + 3] = 255;
                }
            }
        }
        elements.ctx.putImageData(imgData, 0, 0);
    }

    // Den nächsten Pixel finden und füllen
    update() {
        // console.log('--------------------------------------');
        let nextPx = this.findNextPixel();
        // console.log(nextPx);
        let envColor = this.findEnvColor(nextPx);
        // console.log(envColor);
        let nextColor = this.findNearestColor(envColor);
        // console.log(nextColor);
        this.pxTable[nextPx.y][nextPx.x] = nextColor.color.color;
        this.render();

        // if(this.colorTable.length> (settings.size.x * settings.size.y) -100)
    }
    iterate(numIterations = 10) {
        for (let i = 0; i < numIterations; i++) {
            this.update()
        }

        if (this.colorTable.length > 10)
            requestAnimationFrame(() => this.iterate(numIterations));
    }

    // Die umgebenden Pixel nach der Farbe analysieren und den Durchschnittt bilden
    findEnvColor({ x, y }) {
        // console.log(x, y);
        let color = [0, 0, 0];
        let numFoundPx = 0;

        // Neun Pixel in der Umgebung abscannen
        // Alle Farbwerte aufeinander addieren
        for (let dY = -1; dY <= 1; dY++) {
            for (let dX = -1; dX <= 1; dX++) {
                // Checken, ob der Pixel innerhalb der Pixeldaten 
                if (
                    x + dX >= 0 &&
                    x + dX < settings.size.x &&
                    y + dY >= 0 &&
                    y + dY < settings.size.y
                ) {
                    let px = this.pxTable[y + dY][x + dX];
                    // console.log(dX, dY);
                    // console.log(px);
                    if (px != null) {
                        color[0] += px[0];
                        color[1] += px[1];
                        color[2] += px[2];
                        numFoundPx++;
                    }
                }
            }
        }
        color = color.map(ch => ~~(ch / numFoundPx));
        return color;

    }

    // Errechnen des Unterschiedes von einer Farbe zur anderen
    calcDistance(color1, color2) {
        let distance = [
            Math.abs(color1[0] - color2[0]),
            Math.abs(color1[1] - color2[1]),
            Math.abs(color1[2] - color2[2]),
        ];
        distance = distance[0] + distance[1] + distance[2];
        return distance;
    }
}

export default RainbowSmoke;