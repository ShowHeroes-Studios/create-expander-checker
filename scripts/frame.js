let createId = null
let gaId = null

let title = document.title

let scripts = document.getElementsByTagName("script")

for (let script of scripts) {
    let src = script.getAttribute("src")
    if (!src)
        continue
    if (src.startsWith("https://static.showheroes.com/customTracking.v1.js")) {
        let url = new URL(src)
        let params = new URLSearchParams(url.search)
        createId = params.get("entity_id")
    }
    if (src.startsWith("https://www.googletagmanager.com/gtag")) {
        let url = new URL(src)
        let params = new URLSearchParams(url.search)
        gaId = params.get("id")
    }
}

window.parent.postMessage(JSON.stringify({trackingMessage: true, createId: createId, gaId: gaId, title: title }), "*")