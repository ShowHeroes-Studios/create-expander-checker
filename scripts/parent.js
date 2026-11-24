// Runs on the Create page. Receives reports from creative iframes (frame.js)
// and renders badges with the results.
//
// All badge content is built with DOM nodes / textContent — never innerHTML —
// because titles and IDs come from user-authored micropages.

const FRAME_ORIGIN = "https://csc-cdn01.showheroes.com"
const MESSAGE_TYPE = "create-tracking-inspector:report"
const CONTAINER_CLASS = "create-expander-analytics-extension"
const TITLE_HINT = "The name of the campaign in Create vs. the HTML title of the micropage"

// Latest report per iframe window, so several iframes don't overwrite each other.
const reports = new Map()

// Hide the badges whenever the user leaves the "Micropage" tab.
// Runs once per batch of mutations; bails out early when there's nothing to hide.
const observer = new MutationObserver(() => {
    if (!document.querySelector(`.${CONTAINER_CLASS}`))
        return

    const activeTabs = document.querySelectorAll(".tabs__slides .tab._active .tab-activator")
    const onMicropageTab = [...activeTabs].some(tab => tab.innerText === "Micropage")

    if (!onMicropageTab)
        clearContainerElement()
})

observer.observe(document, { childList: true, subtree: true })

window.addEventListener("message", (event) => {
    if (event.origin !== FRAME_ORIGIN)
        return
    if (event.data?.type !== MESSAGE_TYPE)
        return

    reports.set(event.source, {
        createId: asString(event.data.createId),
        gaId: asString(event.data.gaId),
        title: asString(event.data.title),
    })
    render()
})

function asString(value) {
    return typeof value === "string" && value !== "" ? value : null
}

function render() {
    // Forget iframes that are no longer on the page.
    const liveWindows = new Set([...document.querySelectorAll("iframe")].map(frame => frame.contentWindow))
    for (const source of reports.keys()) {
        if (!liveWindows.has(source))
            reports.delete(source)
    }

    // Identical reports (e.g. desktop + mobile preview of the same page) are shown once.
    const unique = new Map()
    for (const report of reports.values())
        unique.set(JSON.stringify(report), report)

    clearContainerElement()
    const container = createContainerElement()
    if (!container)
        return

    const showLabels = unique.size > 1
    let index = 1
    for (const report of unique.values()) {
        if (showLabels)
            container.append(badge("", `Frame ${index++}:`))
        container.append(
            checkCreateId(report.createId),
            checkGaId(report.gaId),
            checkTitle(report.title),
        )
    }
}

function clearContainerElement() {
    document.querySelector(`.${CONTAINER_CLASS}`)?.remove()
}

function createContainerElement() {
    const app = document.querySelector("#app")
    if (!app)
        return null
    const container = el("div", { class: CONTAINER_CLASS })
    app.append(container)
    return container
}

function currentCampaignId() {
    const match = window.location.pathname.match(/\/(\d+)\/?$/)
    return match ? match[1] : null
}

function checkCreateId(id) {
    if (!id)
        return badge("error", "😵 Tracking not implemented!")

    const link = el("a", { href: `https://create.showheroes.com/creative/analytics/${encodeURIComponent(id)}` }, id)
    const campaignId = currentCampaignId()

    if (!campaignId)
        return badge("warning", "⚠️ Can't read campaign ID from URL, tracked as: ", link)
    if (id === campaignId)
        return badge("success", "✓ Tracking correct: ", link)
    return badge("warning", "⚠️ Tracked with different ID: ", link)
}

function checkGaId(id) {
    if (!id)
        return badge("error", "😵 GA not implemented!")

    const property = Object.hasOwn(GA_PROPERTIES, id) ? GA_PROPERTIES[id] : null
    if (property) {
        const link = el("a", { href: property.url, target: "_blank", rel: "noopener" }, property.name)
        return badge("success", "✓ GA implemented (", link, ")")
    }
    return badge("warning", "⚠️ Unknown GA implemented: ", el("pre", {}, id))
}

function checkTitle(title) {
    const field = document.querySelector(`#title[name="title"]`)
    const hint = (text) => el("span", { class: "hint", title: TITLE_HINT }, text)

    if (!field)
        return badge("warning", "⚠️ Campaign title field not found")

    // Form fields hold their text in .value; other elements in textContent.
    const campaignTitle = ("value" in field ? field.value : field.textContent).trim()

    if (campaignTitle === (title ?? "").trim())
        return badge("success", "✓ Campaign ", hint("titles"), " match")
    return badge("warning", "⚠️ ", hint("Titles"), " don't match: ", el("pre", {}, title ?? "(empty)"))
}

// Content is wrapped in a <span> because .badge is display:flex — bare text
// nodes would become separate flex items and lose their edge whitespace.
function badge(style, ...children) {
    return el("div", { class: `badge ${style}`.trim() }, el("span", {}, ...children))
}

// Tiny DOM builder. Strings become text nodes, so nothing is parsed as HTML.
function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag)
    for (const [name, value] of Object.entries(attrs))
        node.setAttribute(name, value)
    node.append(...children)
    return node
}
