const rp = require('request-promise');
require('./plugins/rendererTacticalMap.js')
require('./plugins/renderRealMap.js')

function download() {
    rp({
        uri: `https://ankama.akamaized.net/games/dofus-tablette/assets/2.21.2/maps/${$('#mapid').val()}.json`,
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
            var elems = document.querySelectorAll('.modal');
            var instances = M.Modal.init(elems);
            $('#alert-message').text(`Error, map ${$('#mapid').val()} doesn't exist`)
            instances[0].open();
        }
    })
}

$('#render').on('click', download)
