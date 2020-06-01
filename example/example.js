let senderType = process.argv[2] || 'stdout';

process.stdout.write(`Running example: ${senderType}\n`);

if (senderType === 'tcp') {
  const SchwarmMetrics = require('..').init({
    endpoint: 'udp://172.17.0.1:5232',
    sender_type: 'tcp',
  });
  SchwarmMetrics.info('metric_name', { key1: 'value1', key2: 'value2' });
} else if (senderType === 'stdout') {
  const SchwarmMetrics = require('..').init({
    sender_type: 'stdout',
  });
  SchwarmMetrics.info('metric_name', { key1: 'value1', key2: 'value2' });
}
