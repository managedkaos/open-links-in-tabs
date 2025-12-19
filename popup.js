// the mit license (mit)
//
// copyright (c) 2013 Managed Kaos
//
// permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "software"), to deal
// in the software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the software, and to permit persons to whom the software is
// furnished to do so, subject to the following conditions:
//
// the above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the software.
//
// the software is provided "as is", without warranty of any kind, express or
// implied, including but not limited to the warranties of merchantability,
// fitness for a particular purpose and noninfringement. in no event shall the
// authors or copyright holders be liable for any claim, damages or other
// liability, whether in an action of contract, tort or otherwise, arising from,
// out of or in connection with the software or the use or other dealings in
// the software.


// a function to open links in tabs
function open_links_in_tabs() {

    // links is an array containing the contents of the textarea in the form.
    // each array element is one line from the form's textarea, terminated by a newline.
    var links = $('textarea').val().split('\n');

    // a regex to see if a URL starts with a valid protocol
    // there are plenty more! I'm starting off simple with http and https
    var protocol_regex = new RegExp(/^https?:\/\//i);

    // a simple regex to see if the URL is valid, only checking http and https
    // snagged from http://codegolf.stackexchange.com/questions/464
    var good_url_regex = new RegExp(/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi);

    // process each link...
    for (var i = 0; i < links.length; i++) {
        // trim whitespace from the link
        links[i] = links[i].trim();

        // skip blank lines...
        if (links[i].length < 1) continue;

        // check that the link is a good URL...
        if (links[i].match(good_url_regex)) {

            // if the link is a good URL, but dosen't start with a protocol,
            // prepend it with http://
            if (!links[i].match(protocol_regex)) {
                links[i] = 'http://' + links[i];
            }

            // open the link in a tab
            chrome.tabs.create({ url: links[i] });

        } else {

            // if the URL is bad, handle it here...
        }
    }
}

// this listener waits for the "go button" to be clicked and then runs the open_links_in_tabs() function.
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('go_button').addEventListener('click', open_links_in_tabs);
});
