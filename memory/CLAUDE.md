# Memory System Index

## Overview
This memory system organizes insights and standards from development sessions into three main categories for efficient retrieval and application.

## ⚙️ skill/ - Learnable Methods & Analysis Skills
Executable methodologies and learnable skills for insight extraction and development processes:

- **conversation-memory-extraction.md** - Cognitive memory extraction methodology (episodic, semantic, procedural)
- **requirement-dimension-analysis.md** - UltraThink framework for Features/Technical/Validation analysis
- **commit-message-generation-rules.md** - Rules for generating commit messages (post-commit)
- **change-review-guide.md** - Systematic 8-dimension methodology for reviewing code changes

### Prompt Usage Guide

**When to use `conversation-memory-extraction.md`:**
- ✅ **After complex development sessions** with multiple decision points
- ✅ **When debugging revealed important insights** about system behavior
- ✅ **After user feedback sessions** that changed product direction
- ✅ **When learning new techniques** or solving novel problems
- ✅ **Post-mortem analysis** of issues and their resolutions

**Output:** Three separate files in respective folders:
- `memory/features/episodes-[topic]-[date].md` (specific events and contexts)
- `memory/fact/concepts-[domain]-[date].md` (principles and relationships)
- `memory/fact/procedures-[process]-[date].md` (actionable standards)

**When to use `requirement-dimension-analysis.md`:**
- ✅ **Before starting major feature development** to extract comprehensive requirements
- ✅ **After completing significant features** to capture implementation insights
- ✅ **When architectural decisions** need documentation for future reference
- ✅ **During technical design reviews** to ensure all dimensions are covered
- ✅ **For knowledge transfer** to other developers or stakeholders

**Output:** Three analysis files:
- `memory/features/[feature-name]-stories-ac.md` (user requirements and acceptance criteria)
- `memory/fact/[feature-name]-technical-rules.md` (implementation patterns and decisions)
- `memory/fact/[feature-name]-validation-patterns.md` (testing and operational procedures)

### Prompt Application Workflow

**For New Feature Development:**
1. Use `requirement-dimension-analysis.md` to extract requirements
2. Document findings in `features/` and `fact/` folders  
3. Use `conversation-memory-extraction.md` post-implementation for lessons learned

**For Post-Implementation Analysis:**
1. Use `conversation-memory-extraction.md` to capture development insights
2. Use `requirement-dimension-analysis.md` if architectural patterns emerged
3. Update existing fact files with new insights

**For Maintenance and Debugging:**
1. Use `conversation-memory-extraction.md` for significant debugging sessions
2. Focus on procedural memory extraction for reusable troubleshooting workflows
3. Update relevant fact files with problem-solution patterns

## 📋 features/ - Feature Requirements & Documentation
Concrete feature implementations with user stories and acceptance criteria:

- **agent-chat-mode-unification.md** - Agent/Chat mode integration and model resolution
- **model-selector-grouping-implementation.md** - Model selector UI grouping and improvements
- **panel-height-expansion-stories-ac.md** - Panel height expansion with Given-When-Then scenarios
- **streaming-stop-functionality-stories-ac.md** - Streaming control implementation and UX
- **streaming-stop-validation-patterns.md** - Streaming control validation strategy and operational procedures
- **tool-to-shortcut-refactoring.md** - Complete semantic naming refactoring (Tool → Shortcut)

## 🔧 fact/ - Project Facts & Standards
Fixed rules, standards, and technical constraints that must be followed:

- **chrome-store-validation.md** - Chrome Web Store compliance patterns and validation rules
- **streaming-stop-technical-rules.md** - Technical implementation patterns for streaming control

## Quick Reference

### For New Feature Development
1. Use `skill/requirement-dimension-analysis.md` to extract comprehensive requirements
2. Document results in `features/[feature-name]-stories-ac.md`
3. Capture technical insights in `fact/[relevant-domain].md`

### For Development Operations
- **Before Committing**: Use systematic review guide in `skill/change-review-guide.md`
- **After Committing**: Generate messages with `skill/commit-message-generation-rules.md`
- **Chrome Store Preparation**: Reference `fact/chrome-store-validation.md`
- **Memory Extraction**: Apply templates from `skill/` directory

### For Knowledge Management
- **Skill**: Learnable methodologies and analysis skills
- **Features**: Product-focused documentation with user impact
- **Fact**: Project standards and technical constraints

## File Naming Conventions
- **Skill**: `[process-name].md` (descriptive, action-oriented)
- **Features**: `[feature-name].md` or `[feature-name]-stories-ac.md`
- **Fact**: `[domain-name]-technical-rules.md` (domain-specific standards)

## Maintenance Guidelines
- Review and update files monthly for relevance
- Cross-reference related content between folders
- Keep individual files under 300 lines for readability
- Add "Last updated" timestamps for version tracking

---
*Last updated: 2025-01-18*
*Structure: skill/ (4 files) | features/ (6 files) | fact/ (2 files)*
*Total: 12 documentation files*