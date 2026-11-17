/**
 * SPIRA signup form — the only place the form address is set.
 *
 * The page POSTs JSON with:
 *   Accept: application/json
 *   Content-Type: application/json
 *
 * Live Formspree form:
 *   https://formspree.io/f/moeddqod
 *
 * Set SPIRA_FORM_ENDPOINT to "" to stop sending. The page then shows a
 * short note instead of failing silently.
 *
 * Fields:
 *   path      "donate-compute" or "help-build"          (hidden)
 *   source    ?ref= if present, otherwise ?utm_source=  (hidden)
 *   email, name, hardware, country, skills, note, updates
 *
 * Google Forms: set SPIRA_FORM_FORMAT to "form" and SPIRA_FORM_FIELDS
 * to a map of those names onto entry IDs. See the README.
 */
window.SPIRA_FORM_ENDPOINT = "https://formspree.io/f/moeddqod";

/** "json" for Formspree. "form" for a Google Form (urlencoded POST). */
window.SPIRA_FORM_FORMAT = "json";

/**
 * Optional rename map. Leave null for Formspree.
 *
 * window.SPIRA_FORM_FIELDS = {
 *   path: "entry.0000000001",
 *   source: "entry.0000000002",
 *   email: "entry.0000000003",
 *   name: "entry.0000000004",
 *   hardware: "entry.0000000005",
 *   country: "entry.0000000006",
 *   skills: "entry.0000000007",
 *   note: "entry.0000000008",
 *   updates: "entry.0000000009"
 * };
 */
window.SPIRA_FORM_FIELDS = null;
