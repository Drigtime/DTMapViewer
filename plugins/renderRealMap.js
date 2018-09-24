function downloadAsset(asset, x, y, sx, sy, hue, ctx) {
    let img = new Image()
    img.onload = () => {
        ctx.save()
        ctx.scale(sx, sy)
        if (hue[0] == -128 && hue[1] == -128 && hue[2] == -128) {
            ctx.filter = `hue-rotate(0deg) saturate(0%) brightness(0%)`;
        }
        ctx.drawImage(img, x, y, img.width, img.height)
        ctx.filter = "none";
        ctx.restore()
    }
    img.src = `https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/gfx/world/png/${asset}.png`;
}

function generateRealMap(mapJson) {
    let canvas = $('#mapStatus')[0];
    canvas.width = 1287;
    canvas.height = 866;
    let ctx = canvas.getContext("2d"),
        content = mapJson,
        img = new Image()
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let midgroundLayer = Object.keys(content.midgroundLayer)
        for (const key of midgroundLayer) {
            if (content.midgroundLayer[key] != undefined) {
                for (const element of content.midgroundLayer[key]) {
                    if (element.g != undefined) {
                        if (element.sx && element.sy) {
                            downloadAsset(element.g, (element.x * (-1)) - 58, element.y * (-1) - 15, element.sx, element.sy, element.hue, ctx)
                        } else if (element.sx && !element.sy) {
                            downloadAsset(element.g, (element.x * (-1)) - 58, element.y + 15, element.sx, 1, element.hue, ctx)
                        } else if (!element.sx && element.sy) {
                            downloadAsset(element.g, element.x + 58, element.y * (-1) - 15, 1, element.sy, element.hue, ctx)
                        } else
                            downloadAsset(element.g, element.x + 58, element.y + 15, 1, 1, element.hue, ctx)
                    }
                }
            }
        }
        if (content.foreground) {
            img = new Image()
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            img.src = `https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/foregrounds/${content.id}.png`;

        }
    }
    img.src = `https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/backgrounds/${content.id}.jpg`;
}