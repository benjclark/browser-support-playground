# Browser Support Playground App

A project aimed at experimenting with browser support implementations, as per the frontend open space issue: https://github.com/springernature/frontend-open-space/issues/316

Uses the frontend stack proposal as the underlying system: https://github.com/springernature/frontend-stack-proposal

Taken from the frontend stack proposal README:
### Installation

It is recommended to run the application with the Node.js version to be found
under the file `./.nvmrc`. If you use `nvm` yourself you can run `nvm use` at
the root of the project to switch to the recommended Node.js version.

1. In your terminal browse to the root of the project
2. Make sure you are running the right node version (e.g `nvm use`)
3. Run `npm ci`
4. Copy `./sample.env` to `./.env` and edit the configuration to your liking, if
   relevant
5. You need to add a mapping in your `hosts` file, so that the domain
   `local.fs.springernature.com` can be resolved to your local machine.  
   Of course you are free to pick a different domain. If you do, search and
   replace the project for occurences of `local.fs.springernature.com`

### To run

1. `npm run build`
2. `npm run serve`
