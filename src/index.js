// Silent Customer Detector
class SilentCustomerDetector {
  constructor(options = {}) {
    this.inactivityThresholdDays = options.inactivityThresholdDays || 14;
    this.criticalInactivityDays = options.criticalInactivityDays || 30;
  }

  evaluateDormancy(account) {
    const { id, name, acv, daysSinceLastLogin, lastFeatureUsed } = account;
    
    let dormancyTier = 'ACTIVE';
    let riskFactor = 0;

    if (daysSinceLastLogin >= this.criticalInactivityDays) {
      dormancyTier = 'CRITICAL_SILENCE';
      riskFactor = 0.95;
    } else if (daysSinceLastLogin >= this.inactivityThresholdDays) {
      dormancyTier = 'DRIFTING_SILENT';
      riskFactor = 0.65;
    }

    const estimatedLossRisk = Math.round(acv * riskFactor);

    return {
      accountId: id,
      accountName: name,
      acv,
      daysSinceLastLogin,
      lastFeatureUsed,
      dormancyTier,
      estimatedLossRisk,
      suggestedOutreach: this.generateOutreachHook(name, daysSinceLastLogin, lastFeatureUsed)
    };
  }

  generateOutreachHook(name, days, feature) {
    if (days >= 30) {
      return `Executive Check-in: "Quick sync regarding ${name}'s strategic roadmap for ${feature}?"`;
    }
    return `Customer Success: "Noticed your team paused work on ${feature} — need a quick hand?"`;
  }

  scanCohort(accounts) {
    const scanned = accounts.map(a => this.evaluateDormancy(a));
    const silentAccounts = scanned.filter(a => a.dormancyTier !== 'ACTIVE');
    const totalPipelineAtRisk = silentAccounts.reduce((sum, a) => sum + a.estimatedLossRisk, 0);

    return {
      totalAudited: accounts.length,
      silentCount: silentAccounts.length,
      totalPipelineAtRisk,
      silentAccounts
    };
  }
}

module.exports = { SilentCustomerDetector };
