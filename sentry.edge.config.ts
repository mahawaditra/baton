// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://db92f9f0ba5e9d7bffd378f18735ee19@o4511871304138752.ingest.us.sentry.io/4511871333367808",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  dataCollection: {
    httpBodies: [],
    cookies: false,
    httpHeaders: { request: false, response: false },
    urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    userInfo: true,
  },
});
