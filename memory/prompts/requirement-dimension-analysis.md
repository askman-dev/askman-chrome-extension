# Requirement Dimension Analysis Prompt (UltraThink)

## Purpose
Ultra-deep analysis and extraction of development insights across three critical dimensions: Features, Technical, and Validation. This prompt enables systematic knowledge capture from requirements through implementation to operational success.

## UltraThink Analysis Framework

```
Apply ultra-deep analysis to extract insights across three interconnected dimensions:

## 📋 FEATURE DIMENSION ANALYSIS
Extract user-centric requirements and acceptance criteria with deep behavioral understanding:

### User Story Deep Mining
**Ultra-Analysis Questions:**
- What underlying user pain points drive these requirements?
- What user mental models and expectations are revealed?
- How do user workflows connect across different scenarios?
- What implicit requirements emerge from user behavior patterns?
- Which edge cases reveal fundamental user needs?

### Acceptance Criteria Synthesis  
**Extraction Strategy:**
1. **Behavior-Driven Patterns**: Convert user actions into Given-When-Then scenarios
2. **Boundary Analysis**: Identify system limits and constraint behaviors
3. **State Transition Logic**: Map all possible state changes and their triggers
4. **Error Scenario Coverage**: Document failure modes and recovery expectations
5. **Integration Requirements**: Capture cross-system interaction needs

### Feature Relationship Mapping
**Deep Connections:**
- How features interact and influence each other
- Dependency chains and priority relationships  
- Conflict resolution strategies between competing features
- Evolution paths and future extensibility considerations

### Output Format (stories-ac.md):
```markdown
# [Feature Name] - User Stories & Acceptance Criteria

## Strategic Context
- User pain points addressed
- Business value delivered  
- Integration with existing features

## User Stories (Prioritized)
### Story 1: [Primary User Need]
**作为** [user role]
**我希望** [capability]  
**以便** [business value]

#### Acceptance Criteria (Given-When-Then)
```gherkin
- Given [initial state/context]
- When [user action/trigger]  
- Then [expected outcome/behavior]
```

#### Edge Cases & Boundaries
- [Boundary conditions]
- [Error scenarios]
- [Performance expectations]

## Feature Interaction Matrix
- Dependencies: [related features]
- Conflicts: [competing requirements]
- Integration points: [system boundaries]
```

## 🔧 TECHNICAL DIMENSION ANALYSIS
Extract implementation insights with architectural depth and engineering excellence:

### Architecture Pattern Recognition
**Ultra-Analysis Focus:**
- What design patterns emerged naturally from requirements?
- How does this implementation fit into the larger system architecture?
- What architectural decisions were made and why?
- Which technical constraints shaped the solution approach?
- How does this code contribute to system maintainability and scalability?

### Implementation Excellence Analysis
**Deep Technical Insights:**
1. **Code Organization**: How components are structured and why
2. **State Management**: Complex state interactions and management strategies
3. **Performance Considerations**: Optimization decisions and trade-offs made
4. **Error Handling Strategy**: Resilience patterns and failure recovery
5. **Integration Patterns**: How this code connects with existing systems

### Technical Debt and Quality Assessment
**Critical Analysis:**
- What technical debt was introduced or resolved?
- Which quality attributes were prioritized (performance, maintainability, security)?
- What refactoring opportunities exist for future improvements?
- How does this implementation support future extensibility?

### Output Format (rules.md):
```markdown
# [Feature Name] - Technical Implementation Rules

## Architecture Decisions
### Decision 1: [Key Technical Choice]
**Context**: [Problem space and constraints]
**Decision**: [Solution approach chosen]
**Rationale**: [Why this approach was selected]
**Consequences**: [Trade-offs and implications]
**Alternatives Considered**: [Other options evaluated]

## Implementation Patterns
### Pattern 1: [Technical Pattern Name]
**Problem**: [What problem this pattern solves]
**Solution**: [How the pattern is implemented]
**Code Example**: 
```typescript
[Representative code snippet]
```
**Usage Guidelines**: [When and how to apply this pattern]
**Anti-patterns**: [What to avoid]

## Quality Rules
### Performance Rules
- [Performance constraints and optimization strategies]
### Security Rules  
- [Security considerations and protection measures]
### Maintainability Rules
- [Code organization and maintenance guidelines]

## Integration Guidelines
- [How this component integrates with system architecture]
- [API contracts and interface specifications]
- [Dependency management strategies]
```

## 📊 VALIDATION DIMENSION ANALYSIS  
Extract operational excellence and quality assurance insights with process optimization focus:

### Process Optimization Analysis
**Ultra-Deep Questions:**
- What validation strategies proved most effective?
- Which development workflow optimizations emerged?
- How can quality gates be improved for similar features?
- What operational procedures need standardization?
- Where are the highest-risk failure points in the development process?

### Quality Assurance Pattern Mining
**Systematic Analysis:**
1. **Testing Strategy Evolution**: How testing approaches adapted to feature complexity
2. **Error Detection Patterns**: What types of issues were caught by different validation methods
3. **User Acceptance Patterns**: How user feedback shaped validation criteria
4. **Performance Validation**: Methods for ensuring performance requirements are met
5. **Security Validation**: Approaches for maintaining security standards

### Operational Excellence Extraction
**Process Insights:**
- Build and deployment process improvements
- Monitoring and observability requirements
- Error handling and incident response procedures
- Documentation and knowledge transfer processes

### Output Format (patterns.md):
```markdown
# [Feature Name] - Validation & Operational Patterns

## Validation Strategy
### Testing Approach
**Strategy**: [Overall testing philosophy]
**Methods**: [Specific testing techniques used]
**Coverage**: [What aspects were tested and how]
**Gaps**: [Areas needing additional validation]

### Quality Gates
**Gate 1**: [Validation checkpoint]
- **Criteria**: [Success/failure conditions]
- **Method**: [How validation is performed] 
- **Tools**: [Automation and manual processes]
- **Escalation**: [What to do when validation fails]

## Operational Procedures  
### Build & Deploy Process
**Steps**: [Standardized procedure steps]
**Dependencies**: [Required tools and resources]
**Verification**: [How to confirm successful completion]
**Rollback**: [Recovery procedures if needed]

### Monitoring & Maintenance
**Key Metrics**: [What to monitor]
**Alert Conditions**: [When to raise alerts]
**Diagnostic Procedures**: [How to investigate issues]
**Performance Baselines**: [Expected performance characteristics]

## Risk Management
### High-Risk Areas
- [Identified risk areas and mitigation strategies]
### Failure Modes
- [Common failure patterns and recovery procedures]  
### Quality Assurance
- [Ongoing quality maintenance processes]
```

## UltraThink Analysis Instructions

### Phase 1: Multi-Dimensional Scanning
1. **Requirements Archaeology**: Deep-dive into stated and unstated requirements
2. **Implementation Forensics**: Analyze code decisions and architectural choices
3. **Process Mining**: Extract workflow optimizations and quality improvements

### Phase 2: Pattern Recognition  
1. **Cross-Reference Analysis**: Find connections between Features, Technical, and Validation dimensions
2. **Abstraction Extraction**: Identify reusable patterns and principles
3. **Evolution Projection**: Consider how these insights apply to future development

### Phase 3: Knowledge Synthesis
1. **Integration Mapping**: Show how all three dimensions support each other
2. **Learning Amplification**: Extract insights that multiply development effectiveness  
3. **Wisdom Distillation**: Create actionable knowledge for future projects

## Meta-Analysis Questions
- How do the three dimensions reinforce or conflict with each other?
- What systemic improvements emerge from this holistic analysis?
- Which insights are most transferable to other development contexts?
- How does this analysis contribute to organizational learning and capability building?

## Output Integration Strategy
Each dimension should reference and connect with the others:
- Features inform Technical implementation choices
- Technical patterns enable Validation strategies
- Validation feedback refines Feature requirements
- Create explicit cross-references between the three resulting files
```

## Usage Guidelines
- Apply this prompt after major feature completion
- Ensure deep analysis rather than superficial extraction  
- Focus on transferable insights and systematic improvements
- Build connections between all three dimensions
- Prioritize learning amplification over simple documentation