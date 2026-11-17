# SPIRA: Shared Pooled Intelligence for Research and AI

SPIRA is a community project. Volunteers pool spare compute from their own PCs to train one capable, fully open language model together, then help serve it.

This repository is the public landing page. The project is at the idea stage: there is no client to install. The page gauges interest. The client, the code, the training data pipeline, and the model weights are planned to be fully open source, developed in the open at [Afflatoria](https://github.com/Afflatoria).

The live URL is intended to be [https://afflatoria.github.io/spira-site/](https://afflatoria.github.io/spira-site/). The organization is [Afflatoria](https://github.com/Afflatoria).

## Preview locally

From this directory:

```bash
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/).

Assets use relative paths (`assets/...`, not `/assets/...`), so the same files also work when the site is served from the `/spira-site/` subpath on GitHub Pages. To check that locally, serve a parent directory that contains this repo as a folder named `spira-site`.

## Signup form

All form settings live in [`assets/config.js`](assets/config.js). That is the only file you need to edit to point the form somewhere else, or to turn it off.

The current endpoint is the live Formspree form:

```text
https://formspree.io/f/moeddqod
```

The browser sends `POST` with `Accept: application/json` and `Content-Type: application/json`.

Until `SPIRA_FORM_ENDPOINT` is a non-empty string, the page does not try to send. It shows a short note telling the visitor that this copy of the site is not connected yet.

### Fields

| Name | What it is |
| --- | --- |
| `source` | Hidden. The `ref` query parameter, or `utm_source` if `ref` is absent. Empty if neither is present. |
| `email` | Required. |
| `name` | Optional. |
| `run_client` | `yes` or `no`. “I'd consider running the SPIRA client on my computer when it exists.” |
| `help_build` | `yes` or `no`. “I'd like to help build SPIRA (code, research, design, community).” |
| `note` | Optional. “Anything you'd like to tell us.” |
| `_subject` | Added on the JSON request so the Formspree email subject reads `SPIRA: interest`. |

Example links for outreach:

- `https://afflatoria.github.io/spira-site/?ref=mastodon`
- `https://afflatoria.github.io/spira-site/?utm_source=newsletter`

`ref` wins if both are present.

### Plug in a different Formspree form

1. Create a form at [formspree.io](https://formspree.io).
2. Copy the endpoint. It looks like `https://formspree.io/f/xxxxxxxx`.
3. In `assets/config.js`, set `window.SPIRA_FORM_ENDPOINT` to that URL.
4. Leave `window.SPIRA_FORM_FORMAT` as `"json"`.
5. Leave `window.SPIRA_FORM_FIELDS` as `null`.
6. Commit and deploy.

Formspree may hold the first real submission until someone confirms the form in the Formspree dashboard. Open the form there and check that submissions are being accepted.

Do not send test submissions to the live endpoint unless you need a single smoke test. If you do, put the word `TEST` in a field so it can be deleted.

### Plug in a Google Form instead

Google Forms does not accept the JSON body this page sends to Formspree. Use the form-encoded option.

1. Create a Google Form with a question for each field you want to keep: `source`, `email`, `name`, `run_client`, `help_build`, and `note`. Use short answers for the text fields. For the two yes/no fields, a short answer that will receive `yes` or `no` is the simplest match. Hidden values still have to be questions on the form, or Google drops them.
2. Open the form, use the menu, and choose **Get pre-filled link**. Type a sample answer for every question, then copy the link.
3. Each answer in that link is an `entry.#########=` pair. Those numbers are the field IDs.
4. Find the submission URL. While viewing the live form, open the page source and copy the `action` of the `<form>`. It looks like `https://docs.google.com/forms/d/e/FORM_ID/formResponse`.
5. Edit `assets/config.js`:

```javascript
window.SPIRA_FORM_ENDPOINT = "https://docs.google.com/forms/d/e/FORM_ID/formResponse";
window.SPIRA_FORM_FORMAT = "form";
window.SPIRA_FORM_FIELDS = {
  source: "entry.0000000001",
  email: "entry.0000000002",
  name: "entry.0000000003",
  run_client: "entry.0000000004",
  help_build: "entry.0000000005",
  note: "entry.0000000006"
};
```

Replace each `entry` ID with the one from your pre-filled link. The keys on the left stay as they are.

6. Google Forms does not send CORS headers, so the browser cannot read Google's response. The page sends `application/x-www-form-urlencoded` and, if the request finishes, shows the thank-you state. It will not show Google's validation errors. Submit once and check the form's response sheet.
7. Use a mock endpoint on your own machine for routine tests. Do not use the live form for that.

To turn the form off again, set `window.SPIRA_FORM_ENDPOINT` back to `""`.

## Deploy

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) deploys to GitHub Pages on every push to `main`. It also has a manual **Run workflow** button.

The job does four things:

1. `actions/configure-pages@v6` with `enablement: true`
2. Copies `index.html`, `robots.txt`, `sitemap.xml`, and `assets/` into `_site/`
3. `actions/upload-pages-artifact@v5`
4. `actions/deploy-pages@v5`

`enablement: true` asks GitHub to turn Pages on and set the source to GitHub Actions if it is not already. The action's own docs say that call needs a token other than the default `GITHUB_TOKEN` (a personal access token with the `repo` scope, or a GitHub App with `administration:write` and `pages:write`). With the default token, the enable step can fail when Pages is still off.

If the workflow cannot enable Pages, an owner needs to set it once:

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

After that, a push to `main` (or a manual run of the workflow) publishes the site. The expected URL is:

[https://afflatoria.github.io/spira-site/](https://afflatoria.github.io/spira-site/)

Organization policy can also block Pages. If Settings has no Pages section, an organization owner has to allow Pages for the org first.

## Privacy

The page loads no third-party analytics, advertising, or font host. Fraunces and Source Sans 3 are files in `assets/fonts/`, under the SIL Open Font License (see the `OFL.txt` files next to them).

The only request to another site is the signup `POST`, and only after someone submits the form.

## Brand image

`assets/og.png` is rendered from [`scripts/og-card.html`](scripts/og-card.html). Favicon PNGs are drawn by [`scripts/render_marks.py`](scripts/render_marks.py). The SVG favicon is `assets/favicon.svg`.
