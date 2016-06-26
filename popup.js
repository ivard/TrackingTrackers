/*
    This script generates table with all found information stored by the
    background script.
 */

var saved_trackers = chrome.extension.getBackgroundPage().saved_trackers;
var table = document.getElementById("current_trackers");
for (key in saved_trackers) {
    var tracker_row = table.insertRow(-1);
    var tracker_col = tracker_row.insertCell(-1);
    tracker_col.rowSpan = saved_trackers[key].length;
    tracker_col.innerHTML = key;
    var site_row = tracker_row;
    for(s in saved_trackers[key]) {
        site_row.insertCell(-1).innerHTML = saved_trackers[key][s].url;
        site_row.insertCell(-1).innerHTML = saved_trackers[key][s].localStorageUsed ? "Yes" : "No";
        site_row.insertCell(-1).innerHTML = saved_trackers[key][s].indexedDBUsed ? "Yes" : "No";
        site_row = table.insertRow(-1);
    }
    table.deleteRow(-1);
}

// Code to enable page to be opened in a separate browser tab.
document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('launch');
    link.addEventListener('click', function() {
        chrome.tabs.create({url: '/popup.html'});
    });
});