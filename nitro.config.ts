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
      proxy: {
        // Loopback, not the public hostname. Proxying to
        // https://timotech-003-site3.ftempurl.com failed in ~1.1s with an
        // empty 500 and nothing in either site's stdout log, while the same
        // build proxied to the same URL correctly from a developer machine.
        // That is the signature of hairpin NAT: the request leaves for the
        // server's own public address and never comes back.
        //
        // Both sites are bindings on the same IIS, so 127.0.0.1 reaches it
        // without leaving the machine, and the Host header below is what IIS
        // routes on — it decides which site answers.
        to: "http://127.0.0.1/api/**",
        headers: {
          host: "timotech-003-site3.ftempurl.com",
        },
      },
    },
  },
};
