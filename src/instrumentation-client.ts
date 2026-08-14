import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://db92f9f0ba5e9d7bffd378f18735ee19@o4511871304138752.ingest.us.sentry.io/4511871333367808",
  tracesSampleRate: 1,
  enableLogs: true,

  dataCollection: {
    httpBodies: [],
    cookies: false,
    httpHeaders: { request: false, response: false },
    urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    userInfo: true,
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
