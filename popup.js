function myAlert(){
    var lines = $('textarea').val().split('\n');

    for ( var i = 0; i < lines.length; i++ ){
        // add code to skip blank lines
        chrome.tabs.create({url:lines[i]});
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('go_button').addEventListener('click', myAlert);
});
