# Change Review Guide

## Purpose
Systematic methodology for reviewing code changes across 8 critical dimensions before committing. Ensures comprehensive quality assessment and prevents common oversights.

## Quick Review Checklist ✅

- [ ] **Completeness**: All 8 dimensions analyzed
- [ ] **Clarity**: Non-technical stakeholders can understand impact
- [ ] **Actionability**: Contains specific next steps or considerations
- [ ] **Evidence-Based**: Includes concrete metrics and measurements
- [ ] **Future-Oriented**: Provides guidance for future changes
- [ ] **Risk Assessment**: Identifies potential issues and mitigation strategies

## 8-Dimension Review Framework

### 1. Technical Implementation
- **What**: Architecture changes, code organization, design patterns
- **Review**: Code quality, maintainability, design decisions
- **Ask**: Is this the best technical approach? Does it follow project conventions?

### 2. Performance Impact
- **What**: Bundle size, memory usage, runtime performance
- **Review**: Optimization opportunities, bottlenecks, scalability
- **Ask**: Will this scale? What's the performance cost? Any new bottlenecks?

### 3. Security Implications
- **What**: Permissions, data handling, vulnerabilities
- **Review**: CSP compliance, XSS protection, authentication
- **Ask**: Are we introducing security risks? Do we need new permissions?

### 4. Dependencies & Infrastructure
- **What**: Package updates, build changes, configuration files
- **Review**: Version compatibility, breaking changes, environment impact
- **Ask**: Will this affect other systems? Any build process changes needed?

### 5. Breaking Changes & Migration
- **What**: API changes, data migration, backward compatibility
- **Review**: Upgrade paths, rollback procedures, user impact
- **Ask**: How do users migrate? What breaks? Can we provide migration tools?

### 6. Testing Coverage
- **What**: Test strategy, coverage changes, regression risk
- **Review**: Unit/integration/e2e tests, edge cases
- **Ask**: How do we know this works? What could break? Test gaps?

### 7. UI/UX Changes
- **What**: Visual changes, interactions, accessibility
- **Review**: User experience, design consistency, accessibility
- **Ask**: Does this improve user experience? Is it accessible? Design-compliant?

### 8. Business Value
- **What**: User impact, feature completion, ROI
- **Review**: Alignment with product goals, user needs
- **Ask**: Does this deliver promised value? Why is this change needed?

## Review Execution Rules

### Rule 1: Systematic Coverage
Review ALL 8 dimensions, even if briefly. Don't skip dimensions because they seem "not applicable."

### Rule 2: Impact-Based Depth
- **High Impact**: Deep review with detailed documentation
- **Medium Impact**: Moderate review with key findings
- **Low Impact**: Quick scan with basic verification

### Rule 3: Evidence Collection
Document findings with concrete metrics, file counts, performance numbers, and specific examples.

### Rule 4: Stakeholder Perspective
Consider impact on: developers, end users, operations, QA, business stakeholders.

### Rule 5: Future Thinking
Consider long-term maintenance, scalability, and evolution. What will this look like in 6 months?

## Review Depth Guidelines

### For Major Features
- Full 8-dimension deep dive
- Detailed documentation for each dimension
- Multiple reviewer perspectives
- Risk assessment with mitigation plans

### For Bug Fixes
- Focus on dimensions 1, 6 (Technical Implementation, Testing)
- Quick scan other dimensions for side effects
- Verify root cause addressed
- Ensure no regression introduced

### For Refactoring
- Emphasize dimensions 1, 2, 6 (Technical, Performance, Testing)
- Ensure behavior unchanged
- Document improvements and rationale
- Verify all tests still pass

### For UI/UX Changes
- Emphasize dimensions 7, 8 (UI/UX, Business Value)
- Test accessibility and responsive design
- Verify design system compliance
- Consider user adoption impact

## Practical Examples

### Example: Adding New API Endpoint
1. ✅ **Technical**: RESTful design, error handling patterns
2. ✅ **Performance**: Query optimization, response caching
3. ✅ **Security**: Authentication, authorization, rate limiting
4. ✅ **Dependencies**: New packages needed? Database migrations?
5. ✅ **Breaking**: API versioning, backward compatibility
6. ✅ **Testing**: API tests, edge cases, error scenarios
7. ✅ **UI/UX**: Frontend integration, error states
8. ✅ **Business**: Solves user need? Aligns with product goals?

### Example: UI Component Refactoring
1. ✅ **Technical**: Code organization, reusability patterns
2. ✅ **Performance**: Bundle size impact, render optimization
3. ✅ **Security**: XSS prevention, data sanitization
4. ✅ **Dependencies**: Styling framework changes
5. ✅ **Breaking**: Component API changes, prop modifications
6. ✅ **Testing**: Visual regression tests, interaction tests
7. ✅ **UI/UX**: Accessibility, design consistency
8. ✅ **Business**: Improved user experience metrics

## Common Pitfalls to Avoid

- ❌ **Dimension Skipping**: Assuming dimensions don't apply
- ❌ **Evidence-Free Review**: Making claims without metrics
- ❌ **Tunnel Vision**: Missing cross-system impacts
- ❌ **Single Perspective**: Only considering developer viewpoint
- ❌ **Present-Only Thinking**: Ignoring future maintenance needs
- ❌ **Incomplete Testing**: Missing edge cases and error scenarios

## Quick Reference Card

| Dimension | Key Questions | Red Flags |
|-----------|---------------|-----------|
| Technical | Best approach? Conventions followed? | Code smells, anti-patterns |
| Performance | Scale? Cost? Bottlenecks? | Memory leaks, slow queries |
| Security | New risks? Permissions needed? | Exposed data, weak auth |
| Dependencies | Breaking changes? Environment impact? | Version conflicts |
| Breaking | Migration path? Rollback plan? | No upgrade strategy |
| Testing | Coverage? Edge cases? | Missing tests, no regression |
| UI/UX | User benefit? Accessible? | Poor UX, accessibility fails |
| Business | Value delivered? Goal alignment? | Feature creep, no user need |

## Integration with Development Workflow

### Pre-Commit
Use this guide before every commit to ensure quality and completeness.

### Code Review
Share this framework with reviewers to ensure consistent evaluation criteria.

### Feature Planning
Apply 8-dimension thinking during feature design to catch issues early.

### Post-Mortem
Use these dimensions to analyze what went wrong and prevent future issues.

---

*Last updated: 2025-01-18*
*This guide provides systematic methodology for comprehensive code change review across all critical dimensions.*