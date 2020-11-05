// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const {dialog} = require('electron').remote;
let $ = require('jquery');
let path = require('path');
let fs = require('fs-extra');
let input = '';
let output = [];
let skipped = [];
let shorted = 0;
let error_timeout;
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function setError({selector, text, timeout}){
    $(selector).css('visibility', 'visible')
    $(selector).html(text);
    error_timeout !== undefined && clearTimeout(error_timeout);
    error_timeout = setTimeout(() => {
        $(selector).css('visibility', 'hidden')
    }, 3000);
}
function chooseInput(){
    let {canceled, filePaths} = await dialog.showOpenDialog({
        properties: ['openDirectory', /*'multiSelections'*/]
    });

    let tmp = fs.readdirSync(filePaths[0]).filter(file =>
        !fs.lstatSync(path.join(filePaths[0], file)).isDirectory()
    );

    if(filePaths.length && tmp.length){
        input = filePaths[0];
        //Input selected icon show
        $('#choosed_input').removeClass('d-none')
        $('#all_count').text(tmp.length);
    } else {
        if(canceled !== true) {
            setError({
                selector: '#alert_msg',
                text: '<strong>Error!</strong> Input directory is empty',
                timeout: 3000
            })
        }
    }
}

function chooseOutput(){
    let {canceled, filePaths} = await dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections']
    });

    if(filePaths.length){
        output = filePaths;
        let html = '';
        for(let dir of filePaths){
            html += '<li class="list-group-item d-flex justify-content-between align-items-center">\n' +
                `      ${escapeHtml(path.basename(dir))}\n` +
                `      <span class="badge badge-dark badge-pill">${fs.readdirSync(dir).length}</span>\n` +
                '    </li>';
        }
        $("#outputs").html(html);
        $("#outputs").removeClass('d-none');
        $('#choosed_output').removeClass('d-none')
    } else {
        if(canceled !== true) {
            setError({
                selector: '#alert_msg',
                text: '<strong>Error!</strong> No  files selected',
                timeout: 3000
            })
        }
    }
}

function getInputFiles(){
   return fs.readdirSync(input).filter(img =>
       (skipped.indexOf(img) == -1) && !fs.lstatSync(path.join(input, img)).isDirectory()
   );
}

async function goBack(){
    input = undefined;
    output = undefined;
    shorted = 0;
    error_timeout = 0;
    skipped = [];
    $("#outputs").addClass('d-none');
    $('#choosed_output').addClass('d-none')
    $('#settings').removeClass('d-none');
    $('#sort').addClass('d-none')
    $('#end').addClass('d-none')
    $("#outputs").html('');
    $("#buttons_container").html('');
    $("#image").attr('src', '');
    $('#choosed_input').addClass('d-none')
    $('#all_count').text(0);
    $("#sorted_count").text(0);
    $("#alert_msg").css('visibility', 'hidden')
    $("#sort_msg").css('visibility', 'hidden')
}
function renderButtons() {
   let id = 0;
   let html = '';
   for(let dir of output){
       html += `<button type="button" data-id="${id}" class="btn btn-secondary mr-1 move_dir">${escapeHtml(path.basename(dir))}</button>`;
       id++;
   }
   html += `<button type="button" class="btn btn-primary mr-1" onclick="skip();">Skip</button>`;
   $("#buttons_container").html(html);
   $(".move_dir").click(function () {
       nextImg($("#image").attr('src'), $(this).data('id'));
   });
}

function skip() {
    skipped.push(path.basename($("#image").attr('src')));
    shorted++;
    $("#sorted_count").text(shorted);

    if(!getInputFiles().length){
        $('#settings').addClass('d-none');
        $('#sort').addClass('d-none')
        $('#end').removeClass('d-none')
    } else {
        $('#image').attr('src', path.join(input, getInputFiles()[0]));
        renderButtons();
    }
}

function nextImg(img, id){
    try {
        fs.moveSync(img, path.join(output[id], path.basename(img)));
        shorted++;
        $("#sorted_count").text(shorted);
    } catch (e){
        setError({
            selector: '#sort_msg',
            text: `<strong>Error!</strong> Moveing file error<hr>${e}`,
            timeout: 3000
        })
    }
    if(!getInputFiles().length){
        $('#settings').addClass('d-none');
        $('#sort').addClass('d-none')
        $('#end').removeClass('d-none')
    } else {
        $('#image').attr('src', path.join(input, getInputFiles()[0]));
        renderButtons();
    }
}

