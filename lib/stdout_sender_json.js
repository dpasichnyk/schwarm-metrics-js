const BaseSender = require('./base_sender');

class StdoutSenderJSON extends BaseSender {
  deliver(metric) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(metric));
  }
}

module.exports = StdoutSenderJSON;
