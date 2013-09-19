function open_links_in_tabs(){

    // links is an array containing the contents of the textarea in the form
    // each array element is one line from the form terminated by a newline
    var links = $('textarea').val().split('\n');

    // process each link
    for ( var i = 0; i < links.length; i++ ){
        
        // add code to skip blank lines
        if (links[i].length < 1 ) continue;

        // add code to check that a proper URL is formed

        
        // and finally, open the URL in tabs
        chrome.tabs.create({url:links[i]});
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('go_button').addEventListener('click', open_links_in_tabs);
});
