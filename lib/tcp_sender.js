const net = require('net');
const BaseSender = require('./base_sender');

class TCPSender extends BaseSender {
  constructor(...args) {
    super(...args);
    this.client = new net.Socket();
  }

  connect() {
    // tcp://172.17.0.1:5232
    const { port, hostname } = new URL(this.config.endpoint);

    this.client.on('error', err => { console.log(err) });
    this.client.connect(port, hostname);
  }

  deliver(metric) {
    this.client.write(`${JSON.stringify(metric)}\n`);
  }
}

module.exports = TCPSender;
