// Runs inside creative iframes. Detects the Create tracking script, the
// GA (gtag) script and unreplaced macros, and reports them to the Create page.

const PARENT_ORIGIN = "https://create.showheroes.com"
const MESSAGE_TYPE = "create-tracking-inspector:report"
const TRACKING_SRC = "https://static.showheroes.com/customTracking.v1.js"
const GTAG_SRC = "https://www.googletagmanager.com/gtag"

// Create macros such as {sh_clickUrl_main}, which the ad system should have
// replaced with real values. Also matches the URL-encoded form %7Bsh_…%7D.
const MACRO_PATTERN = /(?:\{|%7B)sh_[^{}\s"'<>%]+(?:\}|%7D)/gi

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

// Searches the whole page source: attributes (href, src, …), text and inline scripts.
function findUnreplacedMacros() {
    const matches = document.documentElement.outerHTML.match(MACRO_PATTERN) ?? []
    const normalized = matches.map(macro => macro.replace(/^%7B/i, "{").replace(/%7D$/i, "}"))
    return [...new Set(normalized)]
}

function report() {
    const urls = collectScriptUrls()
    const message = {
        type: MESSAGE_TYPE,
        createId: findParam(urls, TRACKING_SRC, "entity_id"),
        gaId: findParam(urls, GTAG_SRC, "id"),
        title: document.title,
        macros: findUnreplacedMacros(),
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
