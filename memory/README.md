# Memory System Index

## Overview
This memory system organizes knowledge and insights from development sessions into three main categories for efficient retrieval and application.

## 🧠 prompts/ - Analysis & Extraction Templates
Structured templates for guiding conversation analysis and requirement extraction:

- **conversation-memory-extraction.md** - Cognitive memory extraction (episodic, semantic, procedural)
- **requirement-dimension-analysis.md** - UltraThink framework for Features/Technical/Validation analysis

### Prompt Usage Guide

**When to use `conversation-memory-extraction.md`:**
- ✅ **After complex development sessions** with multiple decision points
- ✅ **When debugging revealed important insights** about system behavior
- ✅ **After user feedback sessions** that changed product direction
- ✅ **When learning new techniques** or solving novel problems
- ✅ **Post-mortem analysis** of issues and their resolutions

**Output:** Three separate files in respective folders:
- `memory/features/episodes-[topic]-[date].md` (specific events and contexts)
- `memory/knowledge/concepts-[domain]-[date].md` (principles and relationships)  
- `memory/knowledge/procedures-[process]-[date].md` (actionable workflows)

**When to use `requirement-dimension-analysis.md`:**
- ✅ **Before starting major feature development** to extract comprehensive requirements
- ✅ **After completing significant features** to capture implementation insights
- ✅ **When architectural decisions** need documentation for future reference
- ✅ **During technical design reviews** to ensure all dimensions are covered
- ✅ **For knowledge transfer** to other developers or stakeholders

**Output:** Three analysis files:
- `memory/features/[feature-name]-stories-ac.md` (user requirements and acceptance criteria)
- `memory/knowledge/[feature-name]-technical-rules.md` (implementation patterns and decisions)
- `memory/knowledge/[feature-name]-validation-patterns.md` (testing and operational procedures)

### Prompt Application Workflow

**For New Feature Development:**
1. Use `requirement-dimension-analysis.md` to extract requirements
2. Document findings in `features/` and `knowledge/` folders  
3. Use `conversation-memory-extraction.md` post-implementation for lessons learned

**For Post-Implementation Analysis:**
1. Use `conversation-memory-extraction.md` to capture development insights
2. Use `requirement-dimension-analysis.md` if architectural patterns emerged
3. Update existing knowledge files with new insights

**For Maintenance and Debugging:**
1. Use `conversation-memory-extraction.md` for significant debugging sessions
2. Focus on procedural memory extraction for reusable troubleshooting workflows
3. Update relevant knowledge files with problem-solution patterns

## 📋 features/ - Feature Requirements & Documentation
Concrete feature implementations with user stories and acceptance criteria:

- **panel-height-expansion-stories-ac.md** - Panel height expansion feature with Given-When-Then scenarios
- *[Future features will be documented here with similar story-AC format]*

## 🔧 knowledge/ - Technical Knowledge Base
Architecture decisions, development processes, and operational insights:

- **commit-guidelines.md** - Comprehensive commit message generation framework
- **chrome-store-validation.md** - Chrome Web Store compliance patterns and validation rules
- *[Future technical insights and architectural decisions will be stored here]*

## Quick Reference

### For New Feature Development
1. Use `prompts/requirement-dimension-analysis.md` to extract comprehensive requirements
2. Document results in `features/[feature-name]-stories-ac.md`
3. Capture technical insights in `knowledge/[relevant-domain].md`

### For Development Operations
- **Commit Messages**: Follow guidelines in `knowledge/commit-guidelines.md`
- **Chrome Store Preparation**: Reference `knowledge/chrome-store-validation.md`
- **Memory Extraction**: Apply templates from `prompts/` directory

### For Knowledge Management
- **Prompts**: Templates for consistent analysis across sessions
- **Features**: Product-focused documentation with user impact
- **Knowledge**: Technical and process insights for long-term reference

## File Naming Conventions
- **Prompts**: `[analysis-type].md` (descriptive, action-oriented)
- **Features**: `[feature-name]-stories-ac.md` (feature name + stories-ac suffix)
- **Knowledge**: `[domain-name].md` (domain-specific knowledge areas)

## Maintenance Guidelines
- Review and update files monthly for relevance
- Cross-reference related content between folders
- Keep individual files under 300 lines for readability
- Add "Last updated" timestamps for version tracking

---
*Last updated: 2025-01-16*  
*Structure: prompts/ | features/ | knowledge/*