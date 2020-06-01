const BaseSender = require('./base_sender');

class BlankSender extends BaseSender {
  deliver() {
    // do nothing
  }
}

module.exports = BlankSender;
