const axios = require('axios');
const SchwarmMetrics = require('../schwarm_metrics');

jest.mock('axios');

describe('schwarm-metrics', () => {
  const rancherResponseMock = {
    container: { external_id: 'container_external_id', name: 'container_name', uuid: 'container_uuid' },
    service: { name: 'service_name' },
    stack: { name: 'stack_name', environment_name: 'stack_environment_name' }
  }

  const getMetricsClient = (data = rancherResponseMock) => {
    const resp = { data, status: 200 }
    axios.get.mockResolvedValue(resp);

    const metrics = SchwarmMetrics.init({ sender_type: 'test' });
    return metrics;
  }

  test('it correctly fetches and stores rancher metadata', async () => {
    const metrics = getMetricsClient();
    await metrics.rancherInfo;

    expect(metrics.sender.rancherInfo).toEqual({
      '@container_id': rancherResponseMock.container.external_id,
      '@container_name': rancherResponseMock.container.name,
      '@rancher_container_uuid_short': rancherResponseMock.container.uuid.slice(0, 8),
      '@rancher_env': rancherResponseMock.stack.environment_name,
      '@service_name': rancherResponseMock.service.name,
      '@stack_name': rancherResponseMock.stack.name,
    });
  })

  test('it adds metadata to the metric', async () => {
    const metrics = getMetricsClient();
    await metrics.rancherInfo;
    await metrics.info('metric_name', 'content');

    const expectedMetric = {
      '@container_id': rancherResponseMock.container.external_id,
      '@container_name': rancherResponseMock.container.name,
      '@service_name': rancherResponseMock.service.name,
      '@name': 'metric_name',
      '@ns': rancherResponseMock.stack.name,
      '@severity': 'info',
      '@stack_name': rancherResponseMock.stack.name,
      '@rancher_container_uuid_short': rancherResponseMock.container.uuid.slice(0, 8),
      '@rancher_env': rancherResponseMock.stack.environment_name,
      stack_name: {
        message: 'content',
      },
    };

    expect(metrics.sent().length).toEqual(1);
    expect(metrics.sent()[0]).toEqual(expectedMetric);
  });
});
