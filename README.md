# Create Expander Checker

A Chrome extension that checks the tracking set up in expander micropages while you look at them in [Create](https://create.showheroes.com).

## Install

1. Clone the repo:
   ```
   git clone https://github.com/ShowHeroes-Studios/create-expander-checker.git
   ```
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the cloned folder.

To update, run `git pull`, then click the reload icon on the extension's card in `chrome://extensions`.

## Use

Open a campaign in Create and go to the **Micropage** tab. When the preview loads, badges appear in the top right:

| Check | ✓ Green | ⚠️ Yellow | 😵 Red |
|---|---|---|---|
| **Tracking** | Create tracking uses this campaign's ID (click it to open its analytics) | The tracking uses a different campaign's ID | No Create tracking script |
| **GA** | A known GA property (click it to open the GA report) | A GA ID that isn't one of ours | No GA script |
| **Titles** | The micropage's HTML `<title>` matches the campaign name | The titles differ (the badge shows the micropage title) | — |

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
