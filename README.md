# schwarm-metrics-js

A package for sending metrics to Logstash / Elasticsearch.

## Installation

Add this to your `package.json`:

    "dependencies": {
      "schwarm-metrics-js": "https://YOUR_TOKEN:x-oauth-basic@github.com/dpasichnyk/schwarm-metrics-js#v0.0.1"
    }

## Metrics on Kubernetes

On Kubernetes the metrics sending got much simplified.

There is only 1 type of sender: stdout_json.

To enable set the `METRICS_RUNNING_ON_KUBERNETES` env variable.

You will also have to explicitly set the `METRICS_NAMESPACE` env variable. In the past the namespace got read from Rancher.

## Usage example

Direct config:

    const SchwarmMetrics = require('schwarm-metrics-js').init({
      endpoint: 'udp://172.17.0.1:5232',
      sender_type: 'tcp',
    });
    SchwarmMetrics.info('metric_name', { key1: 'value1', key2: 'value2' });

or stdout

    const SchwarmMetrics = require('schwarm-metrics-js').init({
      sender_type: 'stdout',
    });
    SchwarmMetrics.info('metric_name', { key1: 'value1', key2: 'value2' });

Config from file:

    const SchwarmMetrics = require('schwarm-metrics-js').initFromFile('/node/metrics_config', {
      sender_type: 'tcp',
    });;
    SchwarmMetrics.info('metric_name', { key1: 'value1', key2: 'value2' });

## Releasing new version

- Update version in `package.json`.
- Update `CHANGELOG.md`.
- `yarn test`
- Commit and tag.
