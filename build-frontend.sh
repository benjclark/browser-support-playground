#!/usr/bin/env bash

# This script is executed by the pipeline
# during the build step. What this will actually
# do is run tests and then clean the directory
# ready for the push step

# Cache FTW!
[ -d /var/halfpipe/shared-cache ] && export npm_config_cache="/var/halfpipe/shared-cache/.npm"

# Exits as soon as it encounters any nonzero exit code, usage of undefined
# variables, failed piped commands
set -o errexit
set -o errtrace
set -o nounset
set -o pipefail

# verbose log
set -v

# Set node/npm version
nvm use

# Download dependencies
npm ci

npm run build
npm run lint:cf
npm run test
npm prune --production

# Fix pipeline error: The app upload is invalid: Symlink(s) point outside of root folder
find . -type l | grep "node_modules/.bin" | xargs rm
