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
 *   source      ?ref= if present, otherwise ?utm_source=  (hidden)
 *   email       required
 *   name        optional
 *   run_client  "yes" or "no"  (would consider running the client later)
 *   help_build  "yes" or "no"  (would like to help build SPIRA)
 *   note        optional free text
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
 *   source: "entry.0000000001",
 *   email: "entry.0000000002",
 *   name: "entry.0000000003",
 *   run_client: "entry.0000000004",
 *   help_build: "entry.0000000005",
 *   note: "entry.0000000006"
 * };
 */
window.SPIRA_FORM_FIELDS = null;
