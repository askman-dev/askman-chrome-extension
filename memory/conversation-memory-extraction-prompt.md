# Conversation Memory Extraction Prompt

## Purpose
Extract and categorize conversation information into three cognitive memory types for future reference and learning.

## Prompt Template

```
Please analyze this conversation and extract information into three cognitive memory types:

## 🎭 Episodic Memory (情景记忆)
Extract specific events, experiences, and contextual situations from the conversation:

### Development Events
- Timeline of key decisions and pivots
- Problem-solving moments and breakthrough insights
- User feedback events and response patterns
- Debugging sessions and resolution experiences
- Testing and validation events

### Contextual Situations  
- Environmental constraints that influenced decisions
- User interaction patterns and preferences
- Technical limitations encountered
- Resource and time constraints
- Collaboration dynamics and communication patterns

### Decision Points
- Critical choice moments with rationale
- Alternative options considered and why they were rejected
- Trade-offs made and their justifications
- Risk assessments and mitigation decisions

### Format Example:
```
**Event**: Panel button positioning debugging session
**Timeline**: After initial implementation, user reported positioning issues
**Context**: Button appeared inside input border instead of outside
**Problem**: CSS positioning conflict with existing layout
**Resolution**: Moved button outside input container, adjusted absolute positioning
**Learning**: Always test UI positioning with existing layout constraints
**Impact**: Led to better understanding of container hierarchy in complex layouts
```

## 🧠 Semantic Memory (语义记忆)  
Extract concepts, principles, and knowledge that transcend specific events:

### Technical Concepts
- Architecture patterns learned or reinforced
- Design principles discovered or validated
- Technology relationships and dependencies
- Abstract problem-solving approaches

### Domain Knowledge
- Industry best practices identified
- User experience principles
- Performance optimization concepts
- Security considerations and patterns

### Relationship Networks
- How concepts connect to each other
- Cause-and-effect relationships in technical decisions
- Knowledge gaps identified and filled

### Format Example:
```
**Concept**: Three-state UI component management
**Definition**: Managing UI components with multiple operational states (default → expanded → maximized)
**Principles**: 
- Priority hierarchies prevent state conflicts
- Temporary state preservation enables smooth user experience
- State persistence scope should match user mental models (tab-scoped vs global)
**Applications**: Panel height expansion, modal dialogs, drawer components
**Related Concepts**: State machines, UI design patterns, user mental models
**Knowledge Gained**: Complex state interactions require explicit priority rules
```

## ⚙️ Procedural Memory (程序记忆)
Extract actionable procedures, skills, and operational knowledge:

### Development Workflows
- Step-by-step processes that were successful
- Debugging methodologies that proved effective
- Testing strategies and validation approaches
- Code review and quality assurance procedures

### Technical Skills
- Implementation techniques and patterns
- Tool usage and configuration methods
- Problem diagnosis and resolution procedures
- Optimization and performance tuning steps

### Operational Procedures
- Build and deployment processes
- Error handling and recovery procedures
- Monitoring and maintenance workflows
- Documentation and knowledge transfer methods

### Format Example:
```
**Procedure**: CSS Hover State Implementation
**Skill Level**: Intermediate
**Steps**:
1. Identify hover trigger area (full-width container)
2. Create nested button element for actual interaction
3. Use group hover classes for container-to-child communication
4. Apply opacity transitions for smooth appearance
5. Test with different cursor states and accessibility tools
6. Validate with screen readers and keyboard navigation

**Key Techniques**:
- Group hover pattern: `group` + `group-hover:opacity-100`
- Smooth transitions: `transition-all duration-200`
- Accessibility: ARIA labels and focus management

**Common Pitfalls**:
- Hover area too narrow (bad UX)
- Missing transition timing (jarring experience)
- Inadequate accessibility support

**Quality Checks**:
- Test on different devices and screen sizes
- Verify keyboard navigation works
- Check with screen reader software
```

## Analysis Instructions
1. Read through the entire conversation chronologically
2. Identify distinct episodes, concepts, and procedures
3. Extract relevant information for each memory type
4. Focus on transferable knowledge and reusable insights
5. Note connections between different memory types
6. Highlight unique or innovative approaches discovered

## Output Requirements
- Create separate sections for each memory type
- Use consistent formatting within each section
- Include cross-references between related memories
- Emphasize actionable insights and learnable patterns
- Focus on information that will be valuable for future similar tasks

## File Naming Convention
Save extracted memories as:
- `memory/episodes-[topic]-[date].md`
- `memory/concepts-[domain]-[date].md` 
- `memory/procedures-[process]-[date].md`
```

## Usage Guidelines
- Apply this prompt after significant conversation sessions
- Focus on extracting transferable knowledge
- Emphasize learning and pattern recognition
- Create connections between different conversation topics
- Build cumulative knowledge base over time