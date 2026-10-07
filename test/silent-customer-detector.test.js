const { test } = require('node:test');
const assert = require('node:assert');
const { SilentCustomerDetector } = require('../src/index.js');

test('SilentCustomerDetector: identifies active account within threshold', () => {
  const detector = new SilentCustomerDetector();
  const res = detector.evaluateDormancy({
    id: '1',
    name: 'Active SaaS',
    acv: 12000,
    daysSinceLastLogin: 3,
    lastFeatureUsed: 'Billing API'
  });
  assert.strictEqual(res.dormancyTier, 'ACTIVE');
  assert.strictEqual(res.estimatedLossRisk, 0);
});

test('SilentCustomerDetector: flags critical silence past 30 days', () => {
  const detector = new SilentCustomerDetector();
  const res = detector.evaluateDormancy({
    id: '2',
    name: 'Ghost Enterprise',
    acv: 24000,
    daysSinceLastLogin: 38,
    lastFeatureUsed: 'Data Sync'
  });
  assert.strictEqual(res.dormancyTier, 'CRITICAL_SILENCE');
  assert.ok(res.estimatedLossRisk > 20000);
});

test('SilentCustomerDetector: scans cohort and tallies aggregate revenue risk', () => {
  const detector = new SilentCustomerDetector();
  const res = detector.scanCohort([
    { id: '1', name: 'A', acv: 5000, daysSinceLastLogin: 2, lastFeatureUsed: 'Auth' },
    { id: '2', name: 'B', acv: 10000, daysSinceLastLogin: 18, lastFeatureUsed: 'Reports' },
    { id: '3', name: 'C', acv: 20000, daysSinceLastLogin: 35, lastFeatureUsed: 'Exports' }
  ]);
  assert.strictEqual(res.totalAudited, 3);
  assert.strictEqual(res.silentCount, 2);
  assert.ok(res.totalPipelineAtRisk > 20000);
});
