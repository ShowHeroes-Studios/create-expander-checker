// Runs inside creative iframes. Detects the Create tracking script and the
// GA (gtag) script and reports what it found to the Create page.

const PARENT_ORIGIN = "https://create.showheroes.com"
const MESSAGE_TYPE = "create-tracking-inspector:report"
const TRACKING_SRC = "https://static.showheroes.com/customTracking.v1.js"
const GTAG_SRC = "https://www.googletagmanager.com/gtag"

let lastSent = null

// Script URLs from <script src> tags, plus every script the page has
// actually loaded (catches scripts injected by JS, even if later removed).
function collectScriptUrls() {
    const fromTags = [...document.querySelectorAll("script[src]")].map(script => script.src)
    const fromNetwork = performance.getEntriesByType("resource")
        .filter(entry => entry.initiatorType === "script")
        .map(entry => entry.name)
    return [...fromTags, ...fromNetwork]
}

function findParam(urls, prefix, param) {
    for (const src of urls) {
        if (!src.startsWith(prefix))
            continue
        try {
            const value = new URL(src).searchParams.get(param)
            if (value)
                return value
        } catch (e) {
            // malformed URL, ignore
        }
    }
    return null
}

function report() {
    const urls = collectScriptUrls()
    const message = {
        type: MESSAGE_TYPE,
        createId: findParam(urls, TRACKING_SRC, "entity_id"),
        gaId: findParam(urls, GTAG_SRC, "id"),
        title: document.title,
    }

    // Only send when something changed, so the parent doesn't re-render needlessly.
    const serialized = JSON.stringify(message)
    if (serialized === lastSent)
        return
    lastSent = serialized

    window.parent.postMessage(message, PARENT_ORIGIN)
}

if (window.parent !== window) {
    report()
    window.addEventListener("load", report)
    new PerformanceObserver(report).observe({ type: "resource" })
}
