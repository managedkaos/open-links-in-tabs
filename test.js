const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Read the popup.js content
const popupJsContent = fs.readFileSync('popup.js', 'utf8');
const testUrlsContent = fs.readFileSync('test_urls.txt', 'utf8');

// Mock DOM
const dom = new JSDOM(`<!DOCTYPE html><textarea>${testUrlsContent}</textarea><button id="go_button"></button>`);
global.window = dom.window;
global.document = dom.window.document;

// Mock jQuery
global.$ = (selector) => {
    if (selector === 'textarea') {
        return {
            val: () => document.querySelector('textarea').value
        };
    }
};

// Mock chrome API
let createdTabs = [];
global.chrome = {
    tabs: {
        create: (props) => {
            createdTabs.push(props.url);
            console.log(`[MockChrome] Opening tab: ${props.url}`);
        }
    }
};

// Evaluate popup.js in the global context so it registers valid globals/functions
// Note: In a real module system we'd export/import, but popup.js is a simple script.
// We'll wrap it or just eval it.
// Ideally, we'd load it into JSDOM, but simply evaling it here exposes `open_links_in_tabs` to global.
eval(popupJsContent);

console.log("--- Starting Test ---");
open_links_in_tabs();
console.log("--- Test Complete ---");

// Verification
// Filter the lines from test_urls.txt to get the expected URLs
// We expect lines starting with http (after trim) to be valid for this test case
const expectedUrls = testUrlsContent.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .filter(l => l.match(/^(http|https):\/\//i));

const processedInputs = testUrlsContent.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

const skippedUrls = [];
const processedUrls = [];

// Replicate simple logic to match inputs to outputs
// Since we know the transformation logic: if input didn't match createdTabs directly or with http://, it was skipped.
processedInputs.forEach(input => {
    const asHttp = input.startsWith('http') ? input : 'http://' + input;
    // Check if this input (or its http equivalent) resulted in a tab
    if (createdTabs.includes(input) || createdTabs.includes(asHttp)) {
        processedUrls.push(input);
    } else {
        skippedUrls.push(input);
    }
});

console.log("\nSkipped URLs:", skippedUrls);

let passed = true;

// Check if expected URLs were opened
expectedUrls.forEach(url => {
    if (!createdTabs.includes(url)) {
        console.error(`FAIL: Expected ${url} to be opened, but it wasn't.`);
        passed = false;
    }
});

// Check if invalid URLs were opened (they shouldn't be)
// Note: The logic in popup.js attempts to prepend http:// to "badlink" if it doesn't match protocol but matches "good_url".
// Let's see what the original logic actually does.
// "badlink" might not match good_url_regex depending on the regex.
// We'll check createdTabs against what we think should happen.

console.log("\nOpened Tabs:", createdTabs);

if (passed) {
    console.log("\nTEST PASSED: All expected URLs were processed.");
} else {
    console.error("\nTEST FAILED: See errors above.");
    process.exit(1);
}
