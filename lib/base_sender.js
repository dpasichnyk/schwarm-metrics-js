class BaseSender {
  constructor(config, namespace, rancherInfo) {
    this.config = config;
    this.namespace = namespace;
    this.rancherInfo = rancherInfo;
  }

  connect() {
  }

  send(severity, name, message, options) {
    const namespace = options.ns || this.namespace || name;

    const completeMessage = {
      '@name': name,
      '@ns': namespace,
      '@severity': severity,
    };

    if (typeof message === 'string') {
      message = { message };
    }

    completeMessage[namespace] = message;

    const metric = {
      ...this.rancherInfo,
      ...completeMessage,
    };

    this.deliver(metric);
  }
}

module.exports = BaseSender;
