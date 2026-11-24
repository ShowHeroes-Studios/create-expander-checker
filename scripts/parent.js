// Hide the badges whenever the user leaves the "Micropage" tab.
// Runs once per batch of mutations; bails out early when there's nothing to hide.
const observer = new MutationObserver(() => {
    if (!document.querySelector(".create-expander-analytics-extension"))
        return

    const activeTabs = document.querySelectorAll(".tabs__slides .tab._active .tab-activator")
    const onMicropageTab = [...activeTabs].some(tab => tab.innerText === "Micropage")

    if (!onMicropageTab)
        clearContainerElement()
})

observer.observe(document, { childList: true, subtree: true })

window.addEventListener(
    "message",
    (event) => {
        if (event.origin !== "https://csc-cdn01.showheroes.com")
            return
        if (!event.data)
            return
        if (!isJsonString(event.data))
            return

        let message = JSON.parse(event.data)

        if (!message.trackingMessage)
            return

        clearContainerElement()
        createContainerElement()

        checkCreateId(message.createId)
        checkGaId(message.gaId)
        checkTitle(message.title)

    }, false
)
  
function isJsonString(str) {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

function clearContainerElement() {
    const container = document.querySelector(".create-expander-analytics-extension")
    if (!container)
        return
    container.remove()
}

function createContainerElement() {
    const container = document.createElement("div")
    container.classList.add("create-expander-analytics-extension")
    document.querySelector("#app").appendChild(container)
}

function checkCreateId(id) {
    const pattern = /.*\/(\d+)$/g
    const pathnameArray = pattern.exec(window.location.pathname)

    if (!id) {
        let text = "😵 Tracking not implemented!"
        createBadge(text, "error")
    } else if (id == pathnameArray[1]) {
        let text = `✓ Tracking correct:&nbsp; <a href="https://create.showheroes.com/creative/analytics/${id}">${id}</a>`
        createBadge(text, "success")
    } else  {
        let text = `⚠️ Tracked with different ID:&nbsp; <a href="https://create.showheroes.com/creative/analytics/${id}">${id}</a>`
        createBadge(text, "warning")
    }
}

function checkGaId(id) {
    if (!id) {
        let text = "😵 GA not implemented!"
        createBadge(text, "error")
    } else if (GA_PROPERTIES[id]) {
        let text = `✓ GA implemented (<a href="${GA_PROPERTIES[id].url}" target="_blank">${GA_PROPERTIES[id].name}</a>)`
        createBadge(text, "success")
    } else  {
        let text = `⚠️ Unknown GA implemented:&nbsp; <pre>${id}</pre>`
        createBadge(text, "warning")
    }
}

function checkTitle(title) {
    const campaignTitle = document.querySelector(`#title[name="title"]`)

    if (campaignTitle.innerHTML == title) {
        let text = `<span>✓ Campaign <span class="hint" title="The name of the campaign in Create vs. the HTML title of the micropage">titles</span> match</span>`
        createBadge(text, "success")
    } else  {
        let text = `<span>⚠️ <span class="hint" title="The name of the campaign in Create vs. the HTML title of the micropage">Titles</span> don't match:&nbsp; <pre>${title}</pre></span>`
        createBadge(text, "warning")
    }
}

function createBadge(text, style) {
    const badge = document.createElement("div")
    badge.classList.add("badge")
    badge.classList.add(style)
    badge.innerHTML = text
    document.querySelector(".create-expander-analytics-extension").appendChild(badge)
}