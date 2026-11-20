/**
 * TEMPORARY: serve the API from the frontend's own origin.
 *
 * The hosting plan's free-SSL quota is exhausted, so backend.mydialearn.com
 * has no certificate and HTTPS to it fails outright. mydialearn.com does have
 * one, and so does the API site's *.ftempurl.com hostname, so the browser
 * talks only to mydialearn.com and this server makes the second hop.
 *
 * Same-origin is not just a workaround for the certificate. With the API on
 * another domain the refresh cookie is cross-site, and Firefox and Safari
 * block those by default, so sign-in would fail for a large share of users.
 *
 * The intended arrangement is an IIS sub-application at /api on this same
 * site, which needs no proxy at all. It could not be created: the control
 * panel's folder picker returns no folders for this control-panel user, and
 * the folder field is read-only. A support ticket is open.
 *
 * WHEN THAT TICKET IS RESOLVED, DELETE THIS FILE and move the API files back
 * to /mydialearn/api. Leaving it in place would silently intercept /api and
 * the sub-application would never see a request.
 *
 * Nitro matches the `/**` tail and appends it to the target, so
 * /api/catalogue/subjects reaches the API as /api/catalogue/subjects. The API
 * runs with API_PREFIX=api on that host, so the prefix is kept on purpose.
 *
 * Nitro reads this file through c12; the Vite wrapper's own `nitro` option
 * exposes only preset and output, so route rules have to live here.
 */
export default {
  routeRules: {
    "/api/**": {
      proxy: "https://timotech-003-site3.ftempurl.com/api/**",
    },
  },
};
