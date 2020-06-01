const BaseSender = require('./base_sender');

class TestSender extends BaseSender {
  constructor(...args) {
    super(...args);
    this.messages = [];
  }

  sent() {
    return this.messages;
  }

  deliver(metric) {
    this.messages.push(metric);
  }
}

module.exports = TestSender;
