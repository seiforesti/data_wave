// Classification Component Exports
export { default as ClassificationFrameworkManager } from './ClassificationFrameworkManager';
export { default as ClassificationRuleManager } from './ClassificationRuleManager';
export { default as ClassificationDashboard } from './ClassificationDashboard';
export { default as ClassificationResults } from './ClassificationResults';
export { default as ClassificationBulkUpload } from './ClassificationBulkUpload';
export { default as ClassificationAuditTrail } from './ClassificationAuditTrail';
export { default as ClassificationSettings } from './ClassificationSettings';
export { default as ClassificationApplier } from './ClassificationApplier';

// Sub-component exports
export { default as FrameworkCard } from './components/FrameworkCard';
export { default as RuleBuilder } from './components/RuleBuilder';
export { default as PatternTester } from './components/PatternTester';
export { default as ClassificationResultCard } from './components/ClassificationResultCard';
export { default as ConfidenceIndicator } from './components/ConfidenceIndicator';
export { default as SensitivityLabelBadge } from './components/SensitivityLabelBadge';

// Types
export type {
  ClassificationFramework,
  ClassificationRule,
  ClassificationResult,
  ClassificationAuditLog,
  RuleType,
  SensitivityLevel,
  ConfidenceLevel
} from './types/classification.types';