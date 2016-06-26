/*
    This content script is injected in every frame present on the current web page.
    If the source URL of the frame contains to one of the stings in trackers as substring,
    the frame is identified as belonging to a chosen tracking service. Then the usage
    statistics are communicated to the background script (see background.js).
 */
trackers = [
    'doubleclick',
    'google-analytics',
    'googlesyndication',
    'googleadservices',
    'scorecardresearch',
    'imrworldwide',
    'adnxs',
    'criteo',
    'rubiconproject',
    'serving-sys',
    'adform',
    'googletagservices',
    'googletagmanager',
    'pubmatic',
    'ads.yahoo',
    'addthis',
    'turn.com',
    'bluekai',
    'mathtag',
    'adadvisor',
];

for(t in trackers) {
    if (document.domain.indexOf(trackers[t]) != -1) {
        var localStorageUsed = localStorage.key(0) != null;
        chrome.runtime.sendMessage({type: 'tracker', tracker: document.domain, localStorageUsed: localStorageUsed, indexedDBUsed: false}, function(resp){
            //alert(resp); //DEBUG LINE
        });
        
        indexedDB.webkitGetDatabaseNames().onsuccess = function(sender,args) {
            var indexedDBUsed = sender.target.result.length > 0;
            chrome.runtime.sendMessage({type: 'tracker', tracker: document.domain, localStorageUsed: false, indexedDBUsed: indexedDBUsed}, function(resp){
                //alert(resp); // DEBUG LINE
            });
        };
    }
}