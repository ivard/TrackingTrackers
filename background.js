/*
This script is the main script belonging to the chrome extension itself.
It receives the data from all content scripts injected into web pages and
stores the data.

IMPORTANT:
-   The data will not be preserved if the browser is closed by the user!
-   The extension only works correctly when using one browser tab at the same time.
    Otherwise it might happen that frames are matched with another active browser tab.
-   Always wait before a website is fully loaded. Otherwise you might miss results.
    This browser extension does not enforce this!

-----------------------------------------------------------------------------------------

current_url stores the url of the tab it is currently storing data of.
The data is updated when the user navigates to another website or moves to
another tab.
 */
var current_url = '';

function update_url() {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        current_url = tabs[0].url;
    });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    update_url();
});

chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {
    update_url();
});

/*
saved_tracker is a dictonary that for every domain belonging to a tracking services
stores which websites used it. For each of those websites is stored whether Local Storage
and/or IndexedDB were used by the particular tracking domain.

Structure:
{
    tracker-a.com => [{url: website-a.com, localStorageUsed: true, indexedDBUsed: false}, ...]
    tracker-b.com => ...
}
 */
var saved_trackers = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        current_url = tabs[0].url;
        update_saved_trackers(request);
    });
});

function update_saved_trackers(request) {
    // First check type of request to make other type of requests possible in the future.
    if (request.type == 'tracker') {
        if(saved_trackers[request.tracker] != undefined) {
            // Tracker domain has been found earlier
            sites = saved_trackers[request.tracker];
            var site_already_found = false;
            for(s in sites) {
                if(current_url == sites[s].url) {
                    // Specific website has been visited before, update data.
                    sites[s].localStorageUsed = sites[s].localStorageUsed ? true : request.localStorageUsed;
                    sites[s].indexedDBUsed = sites[s].indexedDBUsed ? true : request.indexedDBUsed;
                    site_already_found = true;
                }
            }
            if(!site_already_found) {
                // New website found that uses already known tracking domain
                sites.push({url: current_url, localStorageUsed: request.localStorageUsed, indexedDBUsed: request.indexedDBUsed});
            }
            saved_trackers[request.tracker] = sites;
        }
        else {
            // New tracking domain found
            saved_trackers[request.tracker] = [{url: current_url, localStorageUsed: request.localStorageUsed, indexedDBUsed: request.indexedDBUsed}];
        }
    }
}