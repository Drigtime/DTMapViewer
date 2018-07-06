tileWidth = 88, 75862069;
tileHeight = 42, 243902439;
MAP_WIDTH = 14;
MAP_HEIGHT = 20;
CELLPOS = [];

var generateTacticalMap = (mapJson) => {
    var obstacles = [];
    var entitiesData = [];
    var los = [];
    var entities = [];
    var content = mapJson;
    for (let index = 0; index < content.cells.length; index++) {
        if (content.cells[index].l == undefined || content.cells[index].l == 64) {
            if (content.midgroundLayer[index] != undefined) {
                for (const element of content.midgroundLayer[index]) {
                    if (element.id != undefined) {
                        entitiesData.push({ cell: index, className: 'InteractiveElement' })
                    }
                }
            }
            obstacles.push(0)
            los.push(0)
        } else if (content.cells[index].l == 2 || content.cells[index].l == 66) {
            if (content.midgroundLayer[index] != undefined) {
                for (const element of content.midgroundLayer[index]) {
                    if (element.id != undefined) {
                        entitiesData.push({ cell: index, className: 'InteractiveElement' })
                    }
                }
            }
            obstacles.push(0)
            los.push(1)
        } else if (content.cells[index].l == 67 && content.cells[index].s == -5 && content.cells[index].f == undefined) {
            obstacles.push(1)
            los.push(1)
            entitiesData.push({ cell: index, className: 'sun' })
        } else if (content.cells[index].l == 195 || (content.cells[index].l == 7 && content.cells[index].f == 10)) {
            obstacles.push(1)
            los.push(1)
            entitiesData.push({ cell: index, className: 'GameRolePlayNpc' })
        } else if ((content.cells[index].l == 7 || content.cells[index].l == 71 || content.cells[index].l == 67 || content.cells[index].l == 3 || content.cells[index].l == 75 || content.cells[index].l == 83 || content.cells[index].l == 99 || content.cells[index].l == 35 || content.cells[index].l == 66) && content.cells[index].c != undefined) {
            entitiesData.push({ cell: index, className: 'changeMap' })
            obstacles.push(1)
            los.push(1)
        } else if (content.cells[index].l == 7 || content.cells[index].l == 71 || content.cells[index].l == 67 || content.cells[index].l == 3 || content.cells[index].l == 75 || content.cells[index].l == 83 || content.cells[index].l == 99 || content.cells[index].l == 35 || content.cells[index].l == 66) {
            if (content.midgroundLayer[index] != undefined) {
                for (const element of content.midgroundLayer[index]) {
                    if (element.id != undefined) {
                        entitiesData.push({ cell: index, className: 'InteractiveElement' })
                    }
                }
            }
            obstacles.push(1)
            los.push(1)
        }
    }
    for (var i in entitiesData) {
        data = entitiesData[i]
        if (!entities[data.cell])
            entities[data.cell] = [];
        if (data.className == "InteractiveElement")
            data.color = "#00ccff"
        else
            data.color = getColorFromString(data.className)
        entities[data.cell].push(data);
    }
    initCells();
    var canvas = $('#mapStatus')[0];
    canvas.width = tileWidth * (MAP_WIDTH + .5);
    canvas.height = tileHeight * (MAP_HEIGHT + .5);
    var cxt = canvas.getContext("2d");
    // cxt.patternQuality = 'fast';
    // cxt.filter = 'fast';
    // cxt.antialias = 'subpixel';

    for (var cellId in CELLPOS) {
        // Affichage de la grille
        drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, 0xFFFFFF, 0x999999);

        // Obstacle
        if (obstacles[cellId] == 0)
            drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, 0x404040);

        // Ligne de vue
        if (los[cellId] == 0)
            drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, 0x808080);

        // Entit�e
        if (entities[cellId] && entities[cellId].length) {
            if (entities[cellId][0].className == "InteractiveElement") {
                drawSquare(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, entities[cellId][0].color);
                printCellId(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, cellId);
            } else if (entities[cellId][0].className == "sun") {
                drawSun(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, entities[cellId][0].color);
                printCellId(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, cellId);
            } else if (entities[cellId][0].className == "changeMap") {
                printCellId(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, cellId);
            } else {
                drawCircle(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, entities[cellId][0].color);
                printCellId(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, cellId);
            }
        }
    }
}

function printCellId(target, x, y, cellId) {
    target.font = "12.5px Arial";
    target.fillStyle = "black"
    target.fillText(cellId, x + tileWidth * .37, y + tileHeight * .62, );
}

function getColorFromString(str) {
    var i = 0;
    var r = 0;
    var g = 0;
    var b = 0;
    for (i = 0; str && i < str.length; ++i) {
        switch (i % 3) {
            case 0:
                r += str.charCodeAt(i) * 20;
                g += str.charCodeAt(i) * 10;
                b += str.charCodeAt(i) * 40;
                break;
            case 1:
                r += str.charCodeAt(i) * 10;
                g += str.charCodeAt(i) * 40;
                b += str.charCodeAt(i) * 20;
                break;
            case 2:
                r += str.charCodeAt(i) * 40;
                g += str.charCodeAt(i) * 20;
                b += str.charCodeAt(i) * 10;
                break;
        }
    }
    r = 0xEE - r % 150;
    g = 0xEE - g % 150;
    b = 0xEE - b % 150;
    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
}

function drawTile(target, x, y, color, borderColor) {
    if (color != undefined)
        target.fillStyle = "#" + color.toString(16);

    if (borderColor != undefined) {
        target.strokeStyle = "#" + borderColor.toString(16);
        target.lineWidth = .5;
    }

    target.beginPath();
    target.moveTo(x + tileWidth / 2, y + 0);
    target.lineTo(x + tileWidth, y + tileHeight / 2);
    target.lineTo(x + tileWidth / 2, y + tileHeight);
    target.lineTo(x + 0, y + tileHeight / 2);
    target.lineTo(x + tileWidth / 2, y + 0);

    if (color != undefined)
        target.fill();

    if (borderColor != undefined)
        target.stroke();
}

function drawCircle(target, x, y, color) {
    if (color != undefined)
        target.fillStyle = "#" + color.toString(16);

    target.beginPath();
    target.arc(x + tileWidth / 2, y + tileHeight / 2, tileHeight / 3, 0, Math.PI * 2, false);
    target.closePath();

    if (color != undefined)
        target.fill();
}

function drawSquare(target, x, y, color) {
    if (color != undefined)
        target.fillStyle = color;

    target.beginPath();
    target.fillRect(x + tileHeight * .7, y + tileHeight * .2, tileHeight * .6, tileHeight * .6);
    target.closePath();

    if (color != undefined)
        target.fill();
}

function drawSun(target, x, y) {
    var img = new Image();
    img.onload = () => {
        target.drawImage(img, x + tileHeight * .45, y + tileHeight * .20)
    }
    img.src = 'https://ankama.akamaized.net/games/dofus-tablette/assets/2.19.0/gfx/world/png/21000.png';
}

function initCells() {
    var startX = 0;
    var startY = 0;
    var cell = 0;
    var b;
    for (a = 0; a < MAP_HEIGHT; a++) {
        for (b = 0; b < MAP_WIDTH; b++) {
            p = cellCoords(cell);
            CELLPOS[cell] = {
                x: startX + b,
                y: startY + b,
                pixelX: p.x * tileWidth + (p.y % 2 == 1 ? tileWidth / 2 : 0),
                pixelY: p.y * tileHeight / 2
            };
            cell++;
        }
        startX++;
        for (b = 0; b < MAP_WIDTH; b++) {
            p = cellCoords(cell);
            CELLPOS[cell] = {
                x: startX + b,
                y: startY + b,
                pixelX: p.x * tileWidth + (p.y % 2 == 1 ? tileWidth / 2 : 0),
                pixelY: p.y * tileHeight / 2
            };
            cell++;
        }
        startY--;
    }
}

function cellCoords(cellId) {
    return {
        x: cellId % MAP_WIDTH,			// X
        y: Math.floor(cellId / MAP_WIDTH)	// Y
    }
}