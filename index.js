// iisnode entry point. IIS hands every request to this file (see web.config);
// it only loads the compiled NestJS app, which reads PORT — a named pipe here.
//
// The config module resolves .env and the upload directory against the working
// directory, so pin it to the site root whatever iisnode started us in.
process.chdir(__dirname);
require('./dist/main.js');
