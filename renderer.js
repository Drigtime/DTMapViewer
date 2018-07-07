const rp = require('request-promise');
require('./plugins/rendererTacticalMap.js')
require('./plugins/renderRealMap.js')

function dlMapJson(mapid) {
    rp({
        uri: `https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/maps/${mapid}.json`,
        json: true
    }).then((repos) => {
        var mapJson = repos;
        if ($('input[name=layer]:checked').val() === 'real') {
            generateRealMap(mapJson)
        } else if ($('input[name=layer]:checked').val() === 'tactical') {
            generateTacticalMap(mapJson)
        }
    }).catch((err) => {
        if (err.statusCode === 404) {
            var elems = document.querySelectorAll('#unknownMap');
            var instances = M.Modal.init(elems);
            $('#unknownMap > .alert-message > h4').text(`Error, map ${mapid} doesn't exist`)
            instances[0].open();
        }
    })
}

function dlData() {
    if ($('#mapid').prop('disabled')) {
        var elems = $('#slide-out');
        var instances = M.Modal.init(elems);
        $('#slide-out').html(`<div class="progress"><div class="indeterminate"></div></div>`)
        instances[0].open();
        Promise.all([
            rp({
                method: 'POST',
                uri: `https://proxyconnection.touch.dofus.com/data/map?lang=fr&v=1.33.2`,
                json: true,
                body: {
                    class: 'MapPositions'
                }
            }),
            rp({
                method: 'POST',
                uri: `https://proxyconnection.touch.dofus.com/data/map?lang=fr&v=1.33.2`,
                json: true,
                body: {
                    class: 'SubAreasWorldMapData'
                }
            })])
            .then((repos) => {

                const mapList = repos[0];
                const areaList = repos[1];
                let x = $('#x').val();
                let y = $('#y').val();
                let match = [];

                for (const map in mapList) {
                    if (mapList[map].posX == x && mapList[map].posY == y) {
                        match.push({ id: mapList[map].id, area: mapList[map].subAreaId, outdoor: mapList[map].outdoor, priority: mapList[map].hasPriorityOnWorldmap, name: "" })
                    }
                }
                for (const map in match) {
                    for (const area in areaList) {
                        if (match[map].area == areaList[area].id) {
                            match[map].name = areaList[area].nameId
                        }
                    }
                }
                let tempMatch = []
                for (const map in match) {
                    if (match[map].name != "") {
                        tempMatch.push(match[map])
                    }
                }
                match = tempMatch;
                $('#slide-out').html(`<div class="collection"></div>`)
                for (const map in match) {
                    $('#slide-out > .collection').append(`<a href="#" class="collection-item" data-map-id="${match[map].id}">${match[map].id}<div class="secondary-content">${match[map].name}</div></a>`)
                }
                $('#slide-out > .collection > a').on('click', (e) => {
                    dlMapJson(e.currentTarget.attributes['data-map-id'].value)
                })
            })
    } else {
        dlMapJson($('#mapid').val())
    }
}

$('#render').on('click', () => {
    dlData()
})
$('#mapid').on('keyup', (key) => {
    if (key.keyCode === 13) {
        dlMapJson($('#mapid').val())
    }
})
$('#x, #y').on('keyup', (key) => {
    if (key.keyCode === 13) {
        dlData()
    }
})
$('#x, #y').on('change', (e) => {
    if ($('#x').val() !== "" || $('#y').val() !== "") {
        $('#mapid').prop('disabled', true)
    } else {
        $('#mapid').prop('disabled', false)
    }
})
$('#mapid').on('change', (e) => {
    if ($('#mapid').val() !== "") {
        $('#x, #y').prop('disabled', true)
    } else {
        $('#x, #y').prop('disabled', false)
    }
})