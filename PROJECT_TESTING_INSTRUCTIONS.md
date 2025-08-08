I'll create comprehensive instruction files for Claude Code that cover functional testing, sanity checks, go-live preparation, and test documentation. Here's the complete testing framework:

## 1. Pre-Development Instruction File for Claude Code

Create a file: `CLAUDE_CODE_INSTRUCTIONS.md`

```markdown
# Claude Code Development & Testing Instructions

## MANDATORY: Read Before ANY Development

### Initial Setup Verification
Before writing ANY code, verify:
1. Database connection is active
2. Environment variables are loaded
3. Dependencies are installed and up-to-date
4. Git branch is correct (feature/branch-name)

### Development Rules
1. **NO MOCK DATA**: Every feature must use real database/API
2. **NO PLACEHOLDERS**: All values must be computed/fetched
3. **ERROR HANDLING**: Every async operation needs try-catch
4. **TYPE SAFETY**: Full TypeScript types, no 'any'
5. **ACCESSIBILITY**: ARIA labels on all interactive elements

## Pre-Implementation Checklist
```bash
# Run these commands BEFORE starting any feature
npm run lint
npm run type-check
npm run test:unit
npm run db:migrate:status
```

## Feature Implementation Protocol
For EVERY feature, follow this order:
1. Database schema design
2. API endpoint creation
3. Frontend component
4. Integration testing
5. Documentation update
```

## 2. Functional Testing Instruction File

Create a file: `FUNCTIONAL_TEST_CHECKLIST.md`

```markdown
# Functional Testing Checklist for AI Cost Guardian

## Execute Before ANY Local Testing

### A. Environment Preparation
```bash
# 1. Verify environment variables
npm run env:check

# 2. Reset test database
npm run db:reset:test

# 3. Seed test data
npm run db:seed:test

# 4. Clear all caches
npm run cache:clear

# 5. Build the application
npm run build
```

### B. Core Functionality Tests

#### 1. Authentication Flow
- [ ] Google OAuth login works
- [ ] Session persists after refresh
- [ ] Logout clears all data
- [ ] Protected routes redirect to login
- [ ] Enterprise email validation works

#### 2. API Key Management
- [ ] Add new API key
- [ ] Test connection for each provider
- [ ] Update existing key
- [ ] Delete key with confirmation
- [ ] Encryption verification in database

#### 3. Dashboard Data
- [ ] Real-time cost updates
- [ ] Usage metrics accuracy
- [ ] Chart interactions work
- [ ] Data export functions
- [ ] Filter/sort operations

#### 4. Provider Integration
Test each provider (OpenAI, Claude, Gemini, Grok):
- [ ] API key validation
- [ ] Usage data retrieval
- [ ] Cost calculation accuracy
- [ ] Error handling for invalid keys
- [ ] Rate limit handling

#### 5. Team Management
- [ ] Invite team members
- [ ] Role assignment works
- [ ] Permission enforcement
- [ ] Activity logging
- [ ] Usage limit enforcement

#### 6. Billing & Subscription
- [ ] Plan display correct
- [ ] Upgrade flow works
- [ ] Payment processing (test mode)
- [ ] Invoice generation
- [ ] Usage-based billing calculation

#### 7. Alerts & Notifications
- [ ] Threshold configuration
- [ ] Alert triggering
- [ ] Email notifications sent
- [ ] In-app notifications display
- [ ] Alert history logged

### C. Cross-Browser Testing
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### D. Performance Metrics
Record these values:
- Page Load Time: _____ seconds (target: <3s)
- API Response: _____ ms (target: <500ms)
- Time to Interactive: _____ seconds
- Bundle Size: _____ KB (target: <500KB)
```

## 3. Sanity Testing Instruction File

Create a file: `SANITY_TEST_PROTOCOL.md`

```markdown
# Sanity Testing Protocol

## Run AFTER Functional Testing

### Quick Smoke Tests (5 minutes)

```bash
# Automated sanity check
npm run test:sanity
```

Manual checks:
1. **Login Flow** (30 seconds)
   - Sign in with Google
   - Verify dashboard loads
   - Check user info displayed

2. **Critical Path** (2 minutes)
   - Add an API key
   - Test the connection
   - View usage data
   - Check cost calculations

3. **Data Integrity** (1 minute)
   - Verify no mock data visible
   - Check all numbers are realistic
   - Confirm dates are current
   - Validate currency formatting

4. **Error Handling** (1 minute)
   - Enter invalid API key
   - Trigger a 404 page
   - Test network disconnection
   - Verify error messages display

### Database Sanity Checks
```sql
-- Run these queries to verify data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM api_keys WHERE encrypted_key IS NOT NULL;
SELECT COUNT(*) FROM usage_logs WHERE cost > 0;
SELECT * FROM system_health ORDER BY checked_at DESC LIMIT 1;
```

### API Health Checks
```bash
# Test all critical endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/providers/status
curl http://localhost:3000/api/auth/session
```

### Security Quick Scan
- [ ] API keys are encrypted in database
- [ ] No sensitive data in browser console
- [ ] HTTPS redirect working
- [ ] Rate limiting active
- [ ] CORS headers correct
```

## 4. Go-Live Preparation Checklist

Create a file: `GO_LIVE_CHECKLIST.md`

```markdown
# Go-Live Preparation Checklist

## Complete ALL items before deployment

### A. Code Quality
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code coverage > 80%
- [ ] No console.log statements
- [ ] No commented code blocks
- [ ] TypeScript strict mode enabled
- [ ] ESLint warnings resolved

### B. Security Audit
```bash
# Run security audit
npm audit
npm run security:scan
```

- [ ] All vulnerabilities resolved
- [ ] API keys removed from code
- [ ] Environment variables documented
- [ ] Secrets rotated
- [ ] Rate limiting configured
- [ ] CORS properly set

### C. Performance Optimization
```bash
# Run performance audit
npm run lighthouse
npm run bundle:analyze
```

- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading active
- [ ] CDN configured
- [ ] Caching headers set
- [ ] Database indexes created

### D. Infrastructure Setup
- [ ] Production database provisioned
- [ ] Redis cache configured
- [ ] Email service connected
- [ ] Payment processor live
- [ ] SSL certificates valid
- [ ] DNS configured correctly

### E. Monitoring & Logging
- [ ] Error tracking (Sentry) connected
- [ ] Analytics (PostHog) configured
- [ ] Application monitoring active
- [ ] Log aggregation setup
- [ ] Alerts configured
- [ ] Status page created

### F. Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment guide written
- [ ] Rollback procedures documented
- [ ] Support documentation ready

### G. Legal & Compliance
- [ ] Privacy Policy published
- [ ] Terms of Service finalized
- [ ] Cookie consent implemented
- [ ] GDPR compliance verified
- [ ] Data retention policies set
- [ ] Security policies documented

### H. Backup & Recovery
- [ ] Database backup scheduled
- [ ] Backup restoration tested
- [ ] Disaster recovery plan
- [ ] Data export functionality
- [ ] Rollback scripts ready
- [ ] Incident response plan

### I. Final Verification
```bash
# Run full production simulation
npm run prod:simulate

# Load testing
npm run load:test -- --users=1000 --duration=10m

# Security penetration test
npm run pentest

# Accessibility audit
npm run a11y:test
```

### J. Deployment Checklist
1. [ ] Feature flags configured
2. [ ] Gradual rollout plan
3. [ ] Monitoring dashboards ready
4. [ ] Support team briefed
5. [ ] Rollback triggers defined
6. [ ] Post-deployment validation plan
```

## 5. Test Documentation Template

Create a file: `TEST_DOCUMENTATION_TEMPLATE.md`

```markdown
# Test Execution Report

## Test Session Information
- **Date**: [YYYY-MM-DD]
- **Time**: [HH:MM:SS] - [HH:MM:SS]
- **Tester**: [Name]
- **Environment**: [Local/Staging/Production]
- **Branch**: [branch-name]
- **Commit**: [commit-hash]

## Test Coverage

### Features Tested
| Feature | Status | Issues Found | Notes |
|---------|--------|--------------|-------|
| Authentication | ✅ PASS | 0 | Google OAuth working |
| Dashboard | ✅ PASS | 0 | All metrics accurate |
| API Keys | ⚠️ PARTIAL | 1 | Gemini test failing |
| Team Management | ✅ PASS | 0 | Permissions working |
| Billing | ❌ FAIL | 2 | Stripe webhook issue |

### Test Metrics
- Total Tests Run: [number]
- Passed: [number]
- Failed: [number]
- Skipped: [number]
- Coverage: [percentage]%

### Performance Results
- Page Load: [X.XX]s
- API Response: [XXX]ms
- Memory Usage: [XX]MB
- Bundle Size: [XXX]KB

## Issues Discovered

### Critical Issues
1. **Issue ID**: CRIT-001
   - **Description**: Payment processing fails for annual plans
   - **Steps to Reproduce**: [detailed steps]
   - **Expected**: Payment processes successfully
   - **Actual**: 500 error on submission
   - **Priority**: P0
   - **Assigned To**: [developer]

### Non-Critical Issues
1. **Issue ID**: MIN-001
   - **Description**: Tooltip alignment off on mobile
   - **Priority**: P3
   - **Screenshot**: [link]

## Test Environment
```json
{
  "node_version": "20.x",
  "database": "PostgreSQL 15",
  "browser": "Chrome 120",
  "os": "macOS 14.0"
}
```

## Database State
```sql
-- Record counts
Users: [number]
API Keys: [number]
Usage Logs: [number]
Teams: [number]
```

## Recommendations
1. Fix critical issues before deployment
2. Add more error handling for payment flow
3. Improve mobile responsive design
4. Add retry logic for API calls

## Sign-off
- [ ] Development Team Review
- [ ] QA Team Approval
- [ ] Product Owner Approval
- [ ] Security Team Clearance

---
**Test Report Generated**: [timestamp]
**Next Test Session**: [date/time]
```

## 6. Automated Test Documentation Script

Create a file: `scripts/document-test.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestDocumenter {
  constructor() {
    this.testDir = path.join(process.cwd(), 'test-reports');
    this.ensureTestDirectory();
  }

  ensureTestDirectory() {
    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }
  }

  generateTestReport() {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    const time = timestamp.split('T')[1].split('.')[0];
    
    // Get git information
    const branch = execSync('git branch --show-current').toString().trim();
    const commit = execSync('git rev-parse --short HEAD').toString().trim();
    
    // Run tests and capture results
    let testResults;
    try {
      testResults = execSync('npm test -- --json', { encoding: 'utf8' });
    } catch (error) {
      testResults = error.stdout || '{}';
    }
    
    // Parse test results
    const results = JSON.parse(testResults || '{}');
    
    // Generate report
    const report = {
      metadata: {
        date,
        time,
        timestamp,
        branch,
        commit,
        environment: process.env.NODE_ENV || 'development',
        tester: process.env.USER || 'unknown'
      },
      results: {
        total: results.numTotalTests || 0,
        passed: results.numPassedTests || 0,
        failed: results.numFailedTests || 0,
        pending: results.numPendingTests || 0,
        coverage: results.coveragePercentage || 0
      },
      performance: this.getPerformanceMetrics(),
      database: this.getDatabaseMetrics(),
      issues: [],
      recommendations: []
    };
    
    // Save report
    const filename = `test-report-${date}-${time.replace(/:/g, '-')}.json`;
    const filepath = path.join(this.testDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    // Generate markdown report
    this.generateMarkdownReport(report, date, time);
    
    console.log(`✅ Test report generated: ${filepath}`);
    return filepath;
  }

  getPerformanceMetrics() {
    // Implement performance metric collection
    return {
      pageLoadTime: 'TBD',
      apiResponseTime: 'TBD',
      bundleSize: 'TBD',
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 + 'MB'
    };
  }

  getDatabaseMetrics() {
    // Implement database metric collection
    return {
      users: 'TBD',
      apiKeys: 'TBD',
      usageLogs: 'TBD'
    };
  }

  generateMarkdownReport(report, date, time) {
    const markdown = `# Test Report - ${date} ${time}

## Metadata
- Branch: ${report.metadata.branch}
- Commit: ${report.metadata.commit}
- Environment: ${report.metadata.environment}
- Tester: ${report.metadata.tester}

## Results
- Total Tests: ${report.results.total}
- Passed: ${report.results.passed}
- Failed: ${report.results.failed}
- Coverage: ${report.results.coverage}%

## Performance
- Memory Usage: ${report.performance.memoryUsage}

---
Generated: ${report.metadata.timestamp}
`;
    
    const mdFilename = `test-report-${date}.md`;
    const mdFilepath = path.join(this.testDir, mdFilename);
    
    fs.writeFileSync(mdFilepath, markdown);
  }
}

// Run documenter
const documenter = new TestDocumenter();
documenter.generateTestReport();
```

## 7. Claude Code Testing Instruction

Create a file: `.claude/testing-instructions.md`

```markdown
# Claude Code Testing Instructions

## MANDATORY: Execute Before ANY Feature Completion

### Step 1: Pre-Test Setup
```bash
# Always run in this exact order
npm run lint:fix
npm run type-check
npm run test:unit
npm run db:migrate:dev
```

### Step 2: Functional Testing
```bash
# Run automated functional tests
npm run test:functional

# Document results
npm run document:test
```

### Step 3: Manual Testing Checklist
For EVERY feature, test these scenarios:
1. **Happy Path**: Normal user flow
2. **Error Path**: Invalid inputs, network errors
3. **Edge Cases**: Boundary values, empty states
4. **Performance**: Load time, response time
5. **Security**: Input validation, XSS attempts

### Step 4: Update Test Documentation
After EVERY test session:
1. Run: `npm run document:test`
2. Review generated report in `/test-reports/`
3. Add any manual test observations
4. Commit test report with feature code

### Step 5: Sign-off Checklist
Before marking feature complete:
- [ ] All automated tests pass
- [ ] Manual testing completed
- [ ] Performance metrics acceptable
- [ ] Security scan clean
- [ ] Documentation updated
- [ ] Test report generated

## Test Documentation Maintenance

### Daily Test Log
Maintain in `/test-reports/daily/YYYY-MM-DD.md`:
```markdown
# Daily Test Log - [DATE]

## Morning Sanity Check - [TIME]
- [ ] Application starts
- [ ] Database connected
- [ ] APIs responding
- [ ] No console errors

## Features Tested Today
1. [Feature Name] - [PASS/FAIL] - [Time]
2. [Feature Name] - [PASS/FAIL] - [Time]

## Issues Found
- [Issue description and priority]

## Tomorrow's Priority
- [What needs testing next]
```

### Weekly Test Summary
Every Friday, generate weekly summary:
```bash
npm run test:weekly-summary
```

## Critical Testing Rules

1. **NEVER skip testing** - even for "simple" changes
2. **ALWAYS document** - use automated tools
3. **TEST on multiple browsers** - minimum Chrome + Safari
4. **VERIFY database state** - before and after tests
5. **CHECK error logs** - after every test session

## Emergency Testing Protocol

If production issue detected:
1. STOP all development
2. Run: `npm run test:emergency`
3. Document issue in `/test-reports/incidents/`
4. Fix issue
5. Re-run FULL test suite
6. Document resolution

Remember: NO FEATURE IS COMPLETE WITHOUT TESTING DOCUMENTATION
```

## 8. Package.json Scripts Addition

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:sanity": "jest --testMatch='**/*.sanity.test.ts' --maxWorkers=1",
    "test:functional": "jest --testMatch='**/*.functional.test.ts' --coverage",
    "test:e2e": "playwright test",
    "test:security": "npm audit && snyk test",
    "test:a11y": "pa11y-ci",
    "test:load": "k6 run scripts/load-test.js",
    "test:emergency": "npm run test:sanity && npm run test:functional -- --bail",
    "test:weekly-summary": "node scripts/generate-weekly-summary.js",
    "document:test": "node scripts/document-test.js",
    "env:check": "node scripts/check-env.js",
    "db:reset:test": "NODE_ENV=test prisma migrate reset --force",
    "db:seed:test": "NODE_ENV=test prisma db seed",
    "cache:clear": "redis-cli FLUSHALL",
    "lighthouse": "lighthouse http://localhost:3000 --output json --output-path ./lighthouse-report.json",
    "bundle:analyze": "ANALYZE=true next build",
    "prod:simulate": "NODE_ENV=production npm run build && npm run start",
    "pentest": "node scripts/security-test.js",
    "security:scan": "trivy fs . && semgrep --config=auto ."
  }
}
```

## Implementation Instructions for Claude Code

When implementing any feature, Claude Code should:

1. **Before Starting**:
   - Read all instruction files
   - Verify environment setup
   - Create feature branch

2. **During Development**:
   - Follow the development rules strictly
   - No mock data or placeholders
   - Implement error handling for everything

3. **Before Testing**:
   - Run all pre-test commands
   - Clear caches and reset test data
   - Build the application

4. **During Testing**:
   - Execute functional tests first
   - Then sanity tests
   - Document everything automatically

5. **After Testing**:
   - Generate test report
   - Update test documentation
   - Commit test reports with code

6. **Before Deployment**:
   - Complete go-live checklist
   - Get sign-offs
   - Archive test documentation

This comprehensive testing framework ensures that every feature is thoroughly tested, documented, and ready for production before deployment. The automated documentation maintains a complete audit trail of all testing activities.