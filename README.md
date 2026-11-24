# Create Expander Checker

A Chrome extension that checks the tracking set up in expander micropages while you look at them in [Create](https://create.showheroes.com).

## Install

1. Download the ZIP: on the [repo page](https://github.com/ShowHeroes-Studios/create-expander-checker), click the green **Code** button, then **Download ZIP**.
2. Unzip it. You'll get a folder called `create-expander-checker-main`.
3. Move that folder somewhere it can stay, such as your Documents folder. Chrome loads the extension from this folder every time it starts, so don't delete it, and don't leave it in Downloads where it might get cleaned up.
4. In Chrome, go to `chrome://extensions` (type it in the address bar).
5. Turn on **Developer mode** with the switch in the top-right corner.
6. Click **Load unpacked** and select the `create-expander-checker-main` folder. Pick the folder that contains `manifest.json`, not a folder above it.

The extension now appears in the list. It works on its own; there's nothing to click. Just open Create (see below).

### Update to a new version

1. Download and unzip the ZIP again, as above.
2. Replace the old `create-expander-checker-main` folder with the new one, keeping the same name and location.
3. Go to `chrome://extensions` and click the reload icon (↻) on the extension's card.

## Use

Open an Expander campaign in Create and go to the **Micropage** tab. When the preview loads, badges appear in the top right:

| Check | ✓ Green | ⚠️ Yellow | 😵 Red |
|---|---|---|---|
| **Tracking** | Create tracking uses this campaign's ID (click it to open its analytics) | The tracking uses a different campaign's ID | No Create tracking script |
| **GA** | A known GA property (click it to open the GA report) | A GA ID that isn't one of ours | No GA script |
| **Titles** | The micropage's HTML `<title>` matches the campaign name | The titles differ (the badge shows the micropage title) | — |
| **URL macros** | Every `{sh_…}` macro (e.g. `{sh_clickUrl_main}`) was replaced with a real URL | Some macros were left as-is (the badge shows the first one and how many more) | — |

No badges? Reload the page. The extension only works on `create.showheroes.com` with creatives served from `csc-cdn01.showheroes.com`.

## Add a GA property

Add an entry to [scripts/ga-properties.js](scripts/ga-properties.js):

```js
"G-XXXXXXXXXX": {
    name: "Country",
    url: "https://analytics.google.com/analytics/web/#/p<property-id>/reports/intelligenthome",
},
```

Then reload the extension.
