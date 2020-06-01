const axios = require('axios');
const readFileSync = require('fs').readFileSync;

const BlankSender = require('./blank_sender');
const StdoutSender = require('./stdout_sender');
const StdoutSenderJSON = require('./stdout_sender_json');
const TCPSender = require('./tcp_sender');
const TestSender = require('./test_sender');
// const UDPSender = require('./udp_sender'); // not implemented yet

const RANCHER_URL = 'http://rancher-metadata.rancher.internal/latest/self';
const DEFAULT_METRICS_CONFIG_PATH = '/node/metrics_config';

class SchwarmMetrics {
  static init(config) {
    const onKubernetes = !!process.env.METRICS_RUNNING_ON_KUBERNETES;

    let senderType;

    if (onKubernetes) {
      senderType = 'stdout_json';
    } else {
      senderType = config.sender_type || SchwarmMetrics.determineSenderType(config.endpoint);
    }

    let Type;

    if (senderType === 'blank') {
      Type = BlankSender;
    } else if (senderType === 'stdout') {
      Type = StdoutSender;
    } else if (senderType === 'stdout_json' || senderType === 'stdout_ugly') {
      Type = StdoutSenderJSON;
    } else if (senderType === 'tcp') {
      Type = TCPSender;
    } else if (senderType === 'test') {
      Type = TestSender;
    } else {
      throw new Error(`Unknow sender type: "${senderType}"`);
    }

    let namespace;
    let rancherInfo;

    if (onKubernetes) {
      namespace = process.env.METRICS_NAMESPACE || 'unknown';
    } else {
      namespace = 'loading...';
      rancherInfo = { loading: true };
    }

    const sender = new Type(config, namespace, rancherInfo);

    sender.connect();

    return new SchwarmMetrics(sender, onKubernetes);
  }

  static initFromFile(path, overwriteOpts = {}) {
    const config = readFileSync(path || DEFAULT_METRICS_CONFIG_PATH);
    return SchwarmMetrics.init({
      ...JSON.parse(config),
      ...overwriteOpts,
    });
  }

  static determineSenderType(url) {
    if (RegExp('^tcp').test(url)) { return 'tcp'; }
    if (RegExp('^udp').test(url)) { return 'udp'; }
    return undefined;
  }

  constructor(sender, onKubernetes) {
    this.sender = sender;
    this.rancherInfo = undefined;

    if (!onKubernetes) {
      this.readRancherInfo();
    }
  }

  async info(name, message, options = {}) {
    if (this.rancherInfo) { await this.rancherInfo }
    this.sender.send('info', name, message, options);
  }

  async error(name, message, options = {}) {
    if (this.rancherInfo) { await this.rancherInfo }
    this.sender.send('error', name, message, options);
  }

  sent() {
    return this.sender.sent();
  }

  readRancherInfo() {
    this.rancherInfo = axios.get(RANCHER_URL, {
      headers: {
        Accept: 'application/json',
      },
    }).then(({ data }) => {
      this.sender.rancherInfo = {
        '@container_id': data.container.external_id,
        '@container_name': data.container.name,
        '@rancher_container_uuid_short': data.container.uuid.slice(0, 8),
        '@rancher_env': data.stack.environment_name,
        '@service_name': data.service.name,
        '@stack_name': data.stack.name,
      };
      this.sender.namespace = data.stack.name;
    }).catch(error => {
      if (error.errno === 'ENOTFOUND') {
        process.stderr.write(`WARNING: could not connect to Rancher at ${RANCHER_URL}\n`);
        this.sender.rancherInfo = {};
        this.sender.namespace = 'local';
        return;
      }
      throw error;
    });
  }
}

module.exports = SchwarmMetrics;
