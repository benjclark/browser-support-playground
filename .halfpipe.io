team: FILL_OUT_PLEASE
pipeline: FILL_OUT_PLEASE
slack_channel: "#FILL_OUT_PLEASE"

feature_toggles:
- update-pipeline

triggers:
- type: docker
  image: "eu.gcr.io/halfpipe-io/build-nvm"
- type: git
  branch: master
  uri: FILL_OUT_PLEASE

tasks:
- type: run
  name: build-frontend
  script: build-frontend.sh
  docker:
      image: eu.gcr.io/halfpipe-io/build-nvm
  save_artifacts:
  - .
- type: deploy-cf
  name: deploy-frontend-to-qa
  manifest: cf/manifest-qa.yml
  api: ((cloudfoundry.api-snpaas))
  username: ((cloudfoundry.username-snpaas))
  password: ((cloudfoundry.password-snpaas))
  space: FILL_OUT_PLEASE
  vars:
    PLATFORM_ENVIRONMENT: qa
    GA_MEASUREMENT_ID: ((env-vars-qa.ga-measurementid))
    SENTRY_DSN_SERVER_SIDE: ((env-vars-qa.sentry-dsn-server-side))
    SENTRY_JS_LOADER_SCRIPT: ((env-vars-qa.sentry-js-loader-script))
    BANDIERA_URL: http://bandiera-qa.springernature.app
    IDP_CLIENT_USERNAME: ((env-vars-qa.idp-client-username))
    IDP_CLIENT_TOKEN: ((env-vars-qa.idp-client-token))
    COOKIE_CONSENT_BUNDLE_URL: ((env-vars-qa.cookie-consent-bundle-url))
  notify_on_success: true
  deploy_artifact: .
  notifications: &notifications
      on_failure:
      - "#FILL_OUT_PLEASE"

- type: deploy-cf
  name: deploy-frontend-to-live
  manifest: cf/manifest-live.yml
  api: ((cloudfoundry.api-snpaas))
  username: ((cloudfoundry.username-snpaas))
  password: ((cloudfoundry.password-snpaas))
  space: FILL_OUT_PLEASE
  vars:
    PLATFORM_ENVIRONMENT: live
    GA_MEASUREMENT_ID: ((env-vars-live.ga-measurementid))
    SENTRY_DSN_SERVER_SIDE: ((env-vars-live.sentry-dsn-server-side))
    SENTRY_JS_LOADER_SCRIPT: ((env-vars-live.sentry-js-loader-script))
    COOKIE_CONSENT_BUNDLE_URL: ((env-vars-live.cookie-consent-bundle-url))
    BANDIERA_URL: http://bandiera.springernature.app
    IDP_CLIENT_USERNAME: ((env-vars-live.idp-client-username))
    IDP_CLIENT_TOKEN: ((env-vars-live.idp-client-token))
  deploy_artifact: .
  notifications: &notifications
      on_failure:
          - "#FILL_OUT_PLEASE"
