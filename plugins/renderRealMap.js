function downloadAsset(asset, x, y, sx, sy, ctx) {
    var img = new Image()
    img.onload = () => {
        ctx.save()
        ctx.scale(sx, sy)
        ctx.drawImage(img, x, y, img.width, img.height)
        ctx.restore()
    }
    img.src = `https://ankama.akamaized.net/games/dofus-tablette/assets/2.19.0/gfx/world/png/${asset}.png`;
}

function generateRealMap(mapJson) {
    var canvas = $('#mapStatus')[0];
    canvas.width = 1287;
    canvas.height = 866;
    var ctx = canvas.getContext("2d");
    let calls = [];
    var content = mapJson
    var img = new Image()
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var midgroundLayer = Object.keys(content.midgroundLayer)
        for (const key of midgroundLayer) {
            if (content.midgroundLayer[key] != undefined) {
                for (const element of content.midgroundLayer[key]) {
                    if (element.g != undefined &&
                        element.g !== 23275 &&
                        element.g !== 30144 &&
                        element.g !== 30143 &&
                        element.g !== 28207 &&
                        element.g !== 20362 &&
                        element.g !== 36500 &&
                        element.g !== 32629) {
                        if (element.hue[0] !== -128 && element.hue[1] !== -128 && element.hue[2] !== -128) {
                            if (element.sx && element.sy) {
                                downloadAsset(element.g, (element.x * (-1)) - 58, element.y * (-1) - 15, element.sx, element.sy, ctx)
                            } else if (element.sx && !element.sy) {
                                downloadAsset(element.g, (element.x * (-1)) - 58, element.y + 15, element.sx, 1, ctx)
                            } else if (!element.sx && element.sy) {
                                downloadAsset(element.g, element.x + 58, element.y * (-1) - 15, 1, element.sy, ctx)
                            } else
                                downloadAsset(element.g, element.x + 58, element.y + 15, 1, 1, ctx)
                        }
                    }
                }
            }
        }
    }
    img.src = `https://ankama.akamaized.net/games/dofus-tablette/assets/2.19.0/backgrounds/${content.id}.jpg`;
}