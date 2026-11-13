const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { JSDOM } = require('jsdom');

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');

// Load the actual popup and bundled jQuery, with only the Chrome API mocked.
function createPopup(t) {
    const dom = new JSDOM(read('popup.html'), { runScripts: 'outside-only' });
    t.after(() => dom.window.close());
    const { window } = dom;
    const opened = [];
    window.chrome = { tabs: { create: ({ url }) => opened.push(url) } };
    window.eval(read('vendor/jquery-3.7.1.min.js'));
    // Initialize after JSDOM's own DOMContentLoaded to avoid duplicate listeners.
    const init = () => {
        window.eval(read('popup.js'));
        window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
        return {
            opened,
            textarea: window.document.getElementById('links_textarea'),
            go: window.document.getElementById('go_button'),
            reset: window.document.getElementById('reset_button'),
        };
    };

    if (window.document.readyState === 'loading') {
        return new Promise((resolve) => {
            window.document.addEventListener('DOMContentLoaded', () => resolve(init()), { once: true });
        });
    }

    return Promise.resolve(init());
}

const cases = [
    ['preserve HTTP and HTTPS URLs',
        'http://example.com\nhttps://example.org/path?x=1&y=2#section\nHTTPS://example.net/path',
        ['http://example.com', 'https://example.org/path?x=1&y=2#section', 'HTTPS://example.net/path']],
    ['prepend HTTP to domains without a protocol',
        'example.com\nsub.example.org:8080/path',
        ['http://example.com', 'http://sub.example.org:8080/path']],
    ['trim whitespace and skip blank lines',
        '  https://someurl.domain\n\thttp://example.com\n \t example.org/path \t \n   \n\t\n\n \t HTTPS://example.net/path?x=1 \r',
        ['https://someurl.domain', 'http://example.com', 'http://example.org/path', 'HTTPS://example.net/path?x=1']],
    ['handle Windows line endings',
        'example.com\r\n\r\nhttps://example.org\r\n',
        ['http://example.com', 'https://example.org']],
    ['ignore empty input', '', []],
    ['skip invalid entries among valid links',
        'badlink\nanother badlink\nhtP://failedlink.com\nhttps://example.org\n!!!',
        ['https://example.org']],
    ['preserve input order and duplicate links',
        'example.org\nhttps://example.com\nexample.org',
        ['http://example.org', 'https://example.com', 'http://example.org']],
    ['process the sample URL fixture exactly', read('test_urls.txt'),
        ['http://google.com', 'http://yahoo.com', 'http://altavista.com',
            'https://askjeeves.com', 'http://youtube.com', 'http://aa.com',
            'http://delta.com', 'http://go.com']],
];

for (const [name, input, expected] of cases) {
    test(name, async (t) => {
        const popup = await createPopup(t);
        popup.textarea.value = input;
        assert.deepEqual(popup.opened, [], 'Loading the popup must not open tabs');
        popup.go.click();
        assert.deepEqual(popup.opened, expected);
    });
}

test('read the current textarea value on each click', async (t) => {
    const popup = await createPopup(t);
    popup.textarea.value = 'example.com';
    popup.go.click();
    popup.textarea.value = 'https://example.org';
    popup.go.click();
    assert.deepEqual(popup.opened, ['http://example.com', 'https://example.org']);
});

test('reset the form without opening tabs', async (t) => {
    const popup = await createPopup(t);
    popup.textarea.value = 'example.com';
    popup.reset.click();
    assert.equal(popup.textarea.value, '');
    popup.go.click();
    assert.deepEqual(popup.opened, []);
});
