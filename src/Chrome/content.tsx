import React from 'react'
import ReactDOM from 'react-dom'
import Actions from '../Util/actions'
import Annote from '../Annote';


// app id
const uniqueId = "on-page-annotator";

console.log("hello from content!");

const app = document.getElementById(uniqueId);

if (!app) {
    const app = document.createElement("div");
    app.id = uniqueId; 
    app.style.width = "100%";
    app.style.height = "100%";
    app.style.position = "absolute";
    app.style.top = "0px";
    app.style.left = "0px";
    app.style.bottom = "0px";
    app.style.right = "0px";
    app.style.pointerEvents = "none"; // allow selection of underneath
    document.body.appendChild(app)
    ReactDOM.render(<Annote />, app) //app rendered in app
}

chrome.runtime.onMessage.addListener(({ type, action }) => {
    if (!app) {
        const app = document.createElement("div");
        app.id = uniqueId; 
        document.body.appendChild(app)
        ReactDOM.render(<Annote />, app) //app rendered in app
    }
    if (app && type == Actions.CLOSE) {
        app.remove();
    }
})
