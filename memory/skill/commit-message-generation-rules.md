# Commit Message Generation Rules

## Core Principle: Story-Driven Development vs Bug Fix Classification

### **Feature Implementation vs Bug Fix**

#### ✅ **Feature Implementation** (feat: commits)
- New functionality being added for the first time
- Implementation iterations during development process
- Code improvements discovered during feature development
- User experience optimizations made while building the feature

#### ✅ **Bug Fixes Applied** (fix: commits or bug fix section in feat: commits)  
- Only fixes to **pre-existing code** (before current git diff)
- Corrections to already-shipped functionality
- Fixes to code that was previously working but broke

### **Common Misclassification**

❌ **Incorrectly labeled as "Bug Fix":**
```
During feature development:
- First attempt: Input clears after async operation  
- Iteration: Move setUserInput('') before async operation
- This is IMPLEMENTATION, not bug fix
```

✅ **Correctly labeled as "Feature Implementation":**
```  
- Streaming stop functionality implementation
- Input clearing timing optimization during development
- UI state management refinements during build process
```

## Commit Message Structure

### For New Features (feat:)
```
feat: implement [feature name] with comprehensive user story validation

Core Features Implemented:
- [List of main functionality delivered]

Story Validation Results:
✅ US-XX-001: [Story description] - PASS
✅ US-XX-002: [Story description] - PASS

Technical Implementation:
- [Key technical decisions and patterns]

Implementation Refinements Made:
- [Improvements made during development process]
- [UX optimizations discovered while building]

Test Coverage:
- [Test strategy and coverage details]

Files Changed:
- [List of modified files with brief descriptions]

Technical Debt Resolved:
- [Any cleanup done as part of this feature]
```

### For Bug Fixes (fix:)
```
fix: resolve [specific issue] in [component/feature]

Issue Analysis:
- Problem: [Description of what was broken]
- Root Cause: [Why it was broken]
- Impact: [User/system impact]

Bug Fixes Applied:
- [Specific fixes to pre-existing code]

Validation:
- [How fix was verified]
- [Regression testing performed]
```

## Story-Driven Context Integration

### When to Reference Stories
- Always include user story validation results for new features
- Reference story acceptance criteria completion status
- Map technical implementation back to user value

### When to Reference Previous Code State
- Only when fixing bugs in already-shipped functionality
- Use git diff analysis to understand what changed from working state
- Focus on restoration of previously working behavior

## Examples

### ✅ Correct Feature Implementation Commit
```
feat: implement streaming stop functionality

Core Features Implemented:
- Manual stream interruption with stop button
- Automatic stream supersession
- Visual state management for streaming status

Implementation Refinements Made:
- Optimized input clearing timing for immediate feedback
- Removed auto-scroll to prevent reading interruption  
- Enhanced template rendering for @page_title support
```

### ❌ Incorrect Bug Fix Labeling  
```
feat: implement streaming stop functionality

Bug Fixes Applied:
- Fixed input clearing delay (this was development iteration)
- Fixed auto-scroll interruption (this was design decision)
- Fixed template rendering (this was implementation refinement)
```

### ✅ Correct Bug Fix Commit
```
fix: restore message template rendering for @page_title tags

Issue Analysis:
- Problem: @page_title tags showing as raw text instead of rendered content
- Root Cause: Previous refactor changed message.rendered to message.content
- Impact: Users lost context information in chat messages

Bug Fixes Applied:
- Restored message.rendered priority in PagePanel.tsx:408
- Added fallback to message.content for compatibility
```

## Key Insight

**The difference between feature implementation iteration and bug fixing:**
- **Feature iteration**: "We're learning how to build this correctly"  
- **Bug fixing**: "This used to work correctly, now it's broken"

Development iterations are part of the creative process, not error correction.