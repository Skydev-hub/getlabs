import 'zone.js/dist/zone-node';

import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as helmet from 'helmet';
import { resolve } from 'path';

import { __rootdir__ } from '../../root';
import { environment } from './src/environments/environment';

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { AppServerModule, ngExpressEngine } = require('../../dist/apps/web/server/main');

const PORT = process.env.PORT || 3000;
const DIST_FOLDER = resolve(__dirname, '../browser');

export function app() {
  const server = express();

  Sentry.init({
    dsn: environment.sentryDsn,
    release: environment.version,
    integrations: [
      new RewriteFrames({
        root: __rootdir__,
      }),
    ],
  });

  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );

  server.set('view engine', 'html');

  server.set('views', DIST_FOLDER);

  // The request handler must be the first middleware on the app
  server.use(Sentry.Handlers.requestHandler());

  // TODO: Review the security options provided by Helmet
  server.use(
    helmet({
      referrerPolicy: {
        policy: 'no-referrer-when-downgrade',
      },
      contentSecurityPolicy: false,
      hsts: {
        maxAge: 15552000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // Compress all responses (TODO: move compression to a proxy layer)
  server.use(compression());

  server.use(cookieParser());

  // Handle redirects
  server.use((req, res, next) => {
    if (req.url === '/index.html') {
      res.redirect(301, 'https://' + req.hostname);
    }

    if (req.headers['x-forwarded-proto'] === 'http') {
      // Special handling for robots.txt
      if (req.url === '/robots.txt') {
        next();
        return;
      }
      res.redirect(301, 'https://' + req.hostname + req.url);
    }

    if (req.hostname.startsWith('www.')) {
      const host = req.hostname.slice(4, req.hostname.length);
      res.redirect(301, 'https://' + host + req.url);
    }

    if (req.hostname.startsWith('care.')) {
      const host = req.hostname.slice(5, req.hostname.length);
      res.redirect(301, 'https://app.' + host + '/care' + req.url);
    }

    if (req.hostname.startsWith('team.')) {
      const host = req.hostname.slice(5, req.hostname.length);
      res.redirect(301, 'https://app.' + host + '/team' + req.url);
    }

    next();
  });

  // Health check endpoint for k8s
  server.get('/healthz', (req, res) => {
    res.sendStatus(200);
  });

  // Static files that include a content hash can be cached for longer
  server.get(
    '*.(js|css)',
    express.static(DIST_FOLDER, {
      // cacheControl: false,
      maxAge: '7d',
    })
  );

  // All other files should not be cached for long
  server.get(
    '*.*',
    express.static(DIST_FOLDER, {
      // cacheControl: false,
      maxAge: '5m',
    })
  );

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    const url = req.originalUrl;

    console.time(`GET: ${url}`);

    res.render(
      'index',
      {
        req,
        res,
        providers: [
          {
            provide: 'REQUEST',
            useValue: req,
          },
          {
            provide: 'RESPONSE',
            useValue: res,
          },
          {
            provide: 'COOKIES',
            useValue: req.cookies,
          },
        ],
      },
      (err, html) => {
        console.timeEnd(`GET: ${url}`);

        if (!!err) {
          throw err;
        }

        res.send(html);
      }
    );
  });

  // The error handler must be before any other error middleware and after all controllers
  server.use(Sentry.Handlers.errorHandler());

  // Optional fallthrough error handler
  server.use((err, req, res, next) => {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    console.error(err);
    res.statusCode = 500;
    res.end('Error: ' + res.sentry + '\n');
  });

  return server;
}

function run() {
  const server = app();

  // Express sits being a proxy in production, so whitelist that proxy in order to get proper request information
  server.set('trust proxy', 'loopback, linklocal, uniquelocal, ::ffff:0:0/96');

  // Start up the Node server
  server.listen(PORT, () => {
    console.log(`Angular Universal Node Express server listening on http://localhost:${PORT}`);
  });

  return server;
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();

  // TODO: This should be replaced with @godaddy/terminus in angular 9+ upgrade
  process.on('SIGINT', function () {
    console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
    process.exit(1);
  });
}
