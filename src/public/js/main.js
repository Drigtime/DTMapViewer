const rp = require("request-promise");

const tileWidth = 88;
const tileHeight = 42;
const MAP_WIDTH = 14;
const MAP_HEIGHT = 20;
let CELLPOS = [];

///////////////////////////////////////////////////////////////////
///                      GENERATE REAL MAP                      ///
///////////////////////////////////////////////////////////////////

function downloadAsset(asset, x, y, sx, sy, hue, ctx) {
    let img = new Image();
    img.onload = () => {
        ctx.save();
        ctx.scale(sx, sy);
        if (hue[0] == -128 && hue[1] == -128 && hue[2] == -128) {
            ctx.filter = `hue-rotate(0deg) saturate(0%) brightness(0%)`;
        }
        ctx.drawImage(img, x, y, img.width, img.height);
        ctx.filter = "none";
        ctx.restore();
    };
    img.src = `https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/gfx/world/png/${asset}.png`;
}

function generateRealMap(mapJson) {
    let canvas = $("#mapStatus")[0];
    canvas.width = 1287;
    canvas.height = 866;
    let ctx = canvas.getContext("2d"),
        content = mapJson,
        img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let midgroundLayer = Object.keys(content.midgroundLayer);
        for (const key of midgroundLayer) {
            if (content.midgroundLayer[key] != undefined) {
                for (const element of content.midgroundLayer[key]) {
                    if (element.g != undefined) {
                        if (element.sx && element.sy) {
                            downloadAsset(element.g, element.x * -1 - 58, element.y * -1 - 15, element.sx, element.sy, element.hue, ctx);
                        } else if (element.sx && !element.sy) {
                            downloadAsset(element.g, element.x * -1 - 58, element.y + 15, element.sx, 1, element.hue, ctx);
                        } else if (!element.sx && element.sy) {
                            downloadAsset(element.g, element.x + 58, element.y * -1 - 15, 1, element.sy, element.hue, ctx);
                        } else downloadAsset(element.g, element.x + 58, element.y + 15, 1, 1, element.hue, ctx);
                    }
                }
            }
        }
        if (content.foreground) {
            img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = `https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/foregrounds/${content.id}.png`;
        }
    };
    img.src = `https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/backgrounds/${content.id}.jpg`;
}

///////////////////////////////////////////////////////////////////
///                    GENERATE TACTICAL MAP                    ///
///////////////////////////////////////////////////////////////////

function generateTacticalMap(mapJson) {
    let obstacles = [];
    let entitiesData = [];
    let los = [];
    let entities = [];
    let content = mapJson;
    for (let index = 0; index < content.cells.length; index++) {
        if (content.cells[index].l == undefined || content.cells[index].l == 64) {
            if (content.midgroundLayer[index] != undefined) {
                for (const element of content.midgroundLayer[index]) {
                    if (element.id != undefined) {
                        entitiesData.push({ cell: index, className: "InteractiveElement" });
                    }
                }
            }
            obstacles.push(0);
            los.push(0);
        } else if (content.cells[index].l == 2 || content.cells[index].l == 66) {
            if (content.midgroundLayer[index] != undefined) {
                for (const element of content.midgroundLayer[index]) {
                    if (element.id != undefined) {
                        entitiesData.push({ cell: index, className: "InteractiveElement" });
                    }
                }
            }
            obstacles.push(0);
            los.push(1);
        } else if (content.cells[index].l == 67 && content.cells[index].s == -5 && content.cells[index].f == undefined) {
            obstacles.push(1);
            los.push(1);
            entitiesData.push({ cell: index, className: "sun" });
        } else if (content.cells[index].l == 195 || (content.cells[index].l == 7 && content.cells[index].f == 10)) {
            obstacles.push(1);
            los.push(1);
            entitiesData.push({ cell: index, className: "GameRolePlayNpc" });
        } else if (
            (content.cells[index].l == 7 ||
                content.cells[index].l == 71 ||
                content.cells[index].l == 67 ||
                content.cells[index].l == 3 ||
                content.cells[index].l == 75 ||
                content.cells[index].l == 83 ||
                content.cells[index].l == 99 ||
                content.cells[index].l == 35 ||
                content.cells[index].l == 66) &&
            content.cells[index].c != undefined
        ) {
            entitiesData.push({ cell: index, className: "changeMap" });
            obstacles.push(1);
            los.push(1);
        } else if (
            content.cells[index].l == 7 ||
            content.cells[index].l == 71 ||
            content.cells[index].l == 67 ||
            content.cells[index].l == 3 ||
            content.cells[index].l == 75 ||
            content.cells[index].l == 83 ||
            content.cells[index].l == 99 ||
            content.cells[index].l == 35 ||
            content.cells[index].l == 66
        ) {
            if (content.midgroundLayer[index] != undefined) {
                for (const element of content.midgroundLayer[index]) {
                    if (element.id != undefined) {
                        entitiesData.push({ cell: index, className: "InteractiveElement" });
                    }
                }
            }
            obstacles.push(1);
            los.push(1);
        }
    }
    for (let i in entitiesData) {
        let data = entitiesData[i];
        if (!entities[data.cell]) entities[data.cell] = [];
        if (data.className == "InteractiveElement") data.color = "#00ccff";
        else data.color = getColorFromString(data.className);
        entities[data.cell].push(data);
    }
    initCells();
    let canvas = $("#mapStatus")[0];
    canvas.width = tileWidth * (MAP_WIDTH + 0.5);
    canvas.height = tileHeight * (MAP_HEIGHT + 0.5);
    let cxt = canvas.getContext("2d");
    // cxt.patternQuality = 'fast';
    // cxt.filter = 'fast';
    // cxt.antialias = 'subpixel';

    for (let cellId in CELLPOS) {
        // Affichage de la grille
        drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, 0xffffff, 0x999999);

        // Obstacle
        if (obstacles[cellId] == 0) drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, 0x404040);

        // Ligne de vue
        if (los[cellId] == 0) drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, 0x808080);

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
    target.fillStyle = "black";
    target.fillText(cellId, x + tileWidth * 0.37, y + tileHeight * 0.62);
}

function getColorFromString(str) {
    let i = 0;
    let r = 0;
    let g = 0;
    let b = 0;
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
    r = 0xee - (r % 150);
    g = 0xee - (g % 150);
    b = 0xee - (b % 150);
    return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
}

function drawTile(target, x, y, color, borderColor) {
    if (color != undefined) target.fillStyle = "#" + color.toString(16);

    if (borderColor != undefined) {
        target.strokeStyle = "#" + borderColor.toString(16);
        target.lineWidth = 0.5;
    }

    target.beginPath();
    target.moveTo(x + tileWidth / 2, y + 0);
    target.lineTo(x + tileWidth, y + tileHeight / 2);
    target.lineTo(x + tileWidth / 2, y + tileHeight);
    target.lineTo(x + 0, y + tileHeight / 2);
    target.lineTo(x + tileWidth / 2, y + 0);

    if (color != undefined) target.fill();

    if (borderColor != undefined) target.stroke();
}

function drawCircle(target, x, y, color) {
    if (color != undefined) target.fillStyle = "#" + color.toString(16);

    target.beginPath();
    target.arc(x + tileWidth / 2, y + tileHeight / 2, tileHeight / 3, 0, Math.PI * 2, false);
    target.closePath();

    if (color != undefined) target.fill();
}

function drawSquare(target, x, y, color) {
    if (color != undefined) target.fillStyle = color;

    target.beginPath();
    target.fillRect(x + tileHeight * 0.7, y + tileHeight * 0.2, tileHeight * 0.6, tileHeight * 0.6);
    target.closePath();

    if (color != undefined) target.fill();
}

function drawSun(target, x, y) {
    let img = new Image();
    img.onload = () => {
        target.drawImage(img, x + tileHeight * 0.45, y + tileHeight * 0.2);
    };
    img.src = "https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/gfx/world/png/21000.png";
}

function initCells() {
    let startX = 0;
    let startY = 0;
    let cell = 0;
    for (let a = 0; a < MAP_HEIGHT; a++) {
        for (let b = 0; b < MAP_WIDTH; b++) {
            const p = cellCoords(cell);
            CELLPOS[cell] = {
                x: startX + b,
                y: startY + b,
                pixelX: p.x * tileWidth + (p.y % 2 == 1 ? tileWidth / 2 : 0),
                pixelY: (p.y * tileHeight) / 2
            };
            cell++;
        }
        startX++;
        for (let b = 0; b < MAP_WIDTH; b++) {
            const p = cellCoords(cell);
            CELLPOS[cell] = {
                x: startX + b,
                y: startY + b,
                pixelX: p.x * tileWidth + (p.y % 2 == 1 ? tileWidth / 2 : 0),
                pixelY: (p.y * tileHeight) / 2
            };
            cell++;
        }
        startY--;
    }
}

function cellCoords(cellId) {
    return {
        x: cellId % MAP_WIDTH, // X
        y: Math.floor(cellId / MAP_WIDTH) // Y
    };
}

///////////////////////////////////////////////////////////////////
///                      DOWNLOAD MAP FILES                     ///
///////////////////////////////////////////////////////////////////

function dlMapJson(mapid) {
    rp({
        uri: `https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/maps/${mapid}.json`,
        json: true
    })
        .then(repos => {
            let mapJson = repos;
            console.log(mapJson);
            if ($("input[name=layer]:checked").val() === "real") {
                generateRealMap(mapJson);
            } else if ($("input[name=layer]:checked").val() === "tactical") {
                generateTacticalMap(mapJson);
            }
        })
        .catch(err => {
            if (err.statusCode === 404) {
                alert(`Map not found`);
            }
        });
}

function dlData() {
    if ($("#mapid").prop("disabled")) {
        $("#slide-out").html(`<div class="progress"><div class="indeterminate"></div></div>`);
        $("#slide-out").sidenav();
        $("#slide-out").sidenav("open");
        Promise.all([
            rp({
                method: "POST",
                uri: `https://proxyconnection.touch.dofus.com/data/map?lang=fr&v=1.33.2`,
                json: true,
                body: {
                    class: "MapPositions"
                }
            }),
            rp({
                method: "POST",
                uri: `https://proxyconnection.touch.dofus.com/data/map?lang=fr&v=1.33.2`,
                json: true,
                body: {
                    class: "SubAreasWorldMapData"
                }
            })
        ]).then(repos => {
            let mapList = repos[0];
            let areaList = repos[1];
            let x = $("#x").val();
            let y = $("#y").val();
            let match = [];

            for (const map in mapList) {
                if (mapList[map].posX == x && mapList[map].posY == y) {
                    match.push({
                        id: mapList[map].id,
                        area: mapList[map].subAreaId,
                        outdoor: mapList[map].outdoor,
                        priority: mapList[map].hasPriorityOnWorldmap,
                        name: ""
                    });
                }
            }
            for (const map in match) {
                for (const area in areaList) {
                    if (match[map].area == areaList[area].id) {
                        match[map].name = areaList[area].nameId;
                    }
                }
            }
            let tempMatch = [];
            for (const map in match) {
                if (match[map].name != "") {
                    tempMatch.push(match[map]);
                }
            }
            match = tempMatch;
            $("#slide-out").html("");
            if (match.length) {
                for (const map in match) {
                    $("#slide-out").append(
                        `<li>
                            <a href="#" class="collection-item" data-map-id="${match[map].id}">${match[map].id}
                                <div class="secondary-content">${match[map].name}</div>
                            </a>
                        </li>`
                    );
                }
            } else {
                $("#slide-out").html(
                    `<li style="text-align: center;color: white">
                        <span>No result found</span>
                    </li>`
                );
            }
            $("#slide-out > li > a").on("click", e => {
                console.log(e.currentTarget.dataset.mapId);
                dlMapJson(e.currentTarget.dataset.mapId);
            });
        });
    } else {
        dlMapJson($("#mapid").val());
    }
}

///////////////////////////////////////////////////////////////////
///                       EVENT LISTENER                        ///
///////////////////////////////////////////////////////////////////

$("#render").on("click", () => {
    dlData();
});

$("#x, #y, #mapid").on("keyup", key => {
    if (key.keyCode === 13) {
        dlData();
    }
});

$("#x, #y").on("change", e => {
    if ($("#x").val() !== "" || $("#y").val() !== "") {
        $("#mapid").prop("disabled", true);
    } else {
        $("#mapid").prop("disabled", false);
    }
});

$("#mapid").on("change", e => {
    if ($("#mapid").val() !== "") {
        $("#x, #y").prop("disabled", true);
    } else {
        $("#x, #y").prop("disabled", false);
    }
});

$(window).resize(() => {
    $("#slide-out").sidenav();
    $("#slide-out").sidenav("close");
});
