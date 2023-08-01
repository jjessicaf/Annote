import Actions from '../Util/actions'

export {}

console.log("background");

/*
const getContent = (tabID: number) => {
    chrome.scripting.executeScript(
        {
            target: { tabId: tabID },
            files: ['./static/js/content.js'],
        },
        () => {
            chrome.tabs.sendMessage(tabID, { type: Actions.ANNOTE })
            return
        },
    )
}
*/