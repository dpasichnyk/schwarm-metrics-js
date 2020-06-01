const BaseSender = require('./base_sender');

class StdoutSender extends BaseSender {
  deliver(metric) {
    // eslint-disable-next-line no-console
    console.log(metric);
  }
}

module.exports = StdoutSender;
