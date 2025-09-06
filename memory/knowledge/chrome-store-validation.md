# Chrome Extension Validation Patterns

## Overview
This document captures Chrome Web Store validation requirements and patterns based on our implemented validation linter. Reference this for future Chrome extension development sessions.

## Chrome Web Store Requirements

### Metadata Limits
- **Extension Description**: Maximum 132 characters
- **Extension Name**: Maximum 75 characters
- **Version Format**: Must follow semantic versioning (x.y.z pattern)

### Validation Sources
- Description and name are validated from `public/_locales/en/messages.json`
- Version is validated from `package.json`

## Implemented Validation Script

### Location
`scripts/validate-chrome-extension.js`

### Key Features
- **Automated validation**: Checks description length, name length, and version format
- **Color-coded output**: Green for success, red for errors, yellow for warnings
- **Detailed reporting**: Shows exact character counts and excess amounts
- **Exit codes**: Returns non-zero exit code on validation failure

### Validation Rules
```javascript
const DESCRIPTION_MAX_LENGTH = 132;
const NAME_MAX_LENGTH = 75;
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
```

### Integration Points
- **Build Process**: Integrated into `build` and `build:firefox` scripts
- **Package.json Scripts**:
  ```json
  {
    "validate:chrome": "node scripts/validate-chrome-extension.js",
    "build": "pnpm validate:chrome && tsc --project tsconfig.json --noEmit && vite build",
    "build:firefox": "pnpm validate:chrome && tsc --noEmit && cross-env __FIREFOX__=true vite build"
  }
  ```

## File Structure Dependencies

### Required Files
1. `public/_locales/en/messages.json` - Contains extension metadata
   ```json
   {
     "extensionDescription": {
       "description": "Extension description",
       "message": "Ask questions and interact with webpage content directly. Read, understand, and analyze everything right on the page."
     },
     "extensionName": {
       "description": "Extension name", 
       "message": "Askman - Read, Ask, and Understand Right Here"
     }
   }
   ```

2. `package.json` - Contains version information
3. `scripts/validate-chrome-extension.js` - Validation script

## Common Validation Errors and Fixes

### 1. Description Too Long
**Error**: `Extension description is too long: 145 characters (max: 132)`

**Fix**: 
- Edit `public/_locales/en/messages.json`
- Shorten the `extensionDescription.message` value
- Aim for concise, impactful messaging

### 2. Name Too Long
**Error**: `Extension name is too long: 80 characters (max: 75)`

**Fix**:
- Edit `public/_locales/en/messages.json` 
- Shorten the `extensionName.message` value
- Consider using abbreviations or removing redundant words

### 3. Invalid Version Format
**Error**: `Package version format invalid: 1.0.0-beta (expected: x.y.z)`

**Fix**:
- Edit `package.json`
- Use semantic versioning format: `major.minor.patch`
- Remove any pre-release identifiers for Chrome Web Store

### 4. Missing Metadata
**Error**: `Extension description not found in messages.json`

**Fix**:
- Ensure `public/_locales/en/messages.json` exists
- Add required `extensionName` and `extensionDescription` objects
- Verify JSON syntax is valid

## Best Practices

### Development Workflow
1. **Pre-commit validation**: Run `pnpm validate:chrome` before committing
2. **Build integration**: Validation automatically runs during build process
3. **CI/CD integration**: Include validation in automated build pipelines

### Character Count Management
- **Description Strategy**: Focus on core value proposition
- **Name Strategy**: Use brand name + key function
- **Testing**: Regularly validate during development, not just at release

### Version Management
- Use semantic versioning consistently
- Chrome Web Store only accepts x.y.z format (no pre-release tags)
- Coordinate version bumps between package.json and manifest

## Usage Examples

### Manual Validation
```bash
# Run validation manually
pnpm validate:chrome

# Build with validation
pnpm build
```

### Expected Output (Success)
```
🔍 Validating Chrome Extension metadata...
✅ Extension description length OK: 117/132 characters
✅ Extension name length OK: 45/75 characters  
✅ Package version format OK: 0.0.18

✅ All Chrome Extension validations passed!
```

### Expected Output (Failure)
```
🔍 Validating Chrome Extension metadata...
❌ Extension description is too long: 145 characters (max: 132)
   Description: "This is an incredibly detailed description that exceeds the Chrome Web Store limit..."
   Exceeds by: 13 characters
✅ Extension name length OK: 18/75 characters
✅ Package version format OK: 0.0.18

💥 Chrome Extension validation failed!
📝 Fix the issues above before building for Chrome Web Store
```

## Integration Notes

### Build Process Integration
- Validation runs before TypeScript compilation
- Validation runs before Vite build
- Process exits with error code 1 on validation failure
- Prevents invalid builds from being created

### Development Environment
- Validation script uses Node.js ES modules
- Requires Node.js environment with `fs`, `path`, and `url` modules
- Color output works in most modern terminals

## Maintenance

### Updating Limits
If Chrome Web Store changes their requirements:
1. Update constants in `scripts/validate-chrome-extension.js`
2. Update documentation in this file
3. Test validation with edge cases

### Adding New Validations
To extend the validation script:
1. Add new validation functions to the script
2. Update error handling and output formatting
3. Document new validations in this file
4. Update build process if needed

## Related Files
- `/scripts/validate-chrome-extension.js` - Main validation script
- `/public/_locales/en/messages.json` - Extension metadata
- `/package.json` - Version and build scripts
- `/memory/chrome-extension-validation-patterns.md` - This documentation

## Quick Reference

### Command Checklist
```bash
# Before committing changes
pnpm validate:chrome

# Build with validation  
pnpm build

# Check current character counts
node -e "
const fs = require('fs');
const messages = JSON.parse(fs.readFileSync('public/_locales/en/messages.json', 'utf8'));
console.log('Description:', messages.extensionDescription.message.length + '/132 chars');
console.log('Name:', messages.extensionName.message.length + '/75 chars');
"
```

### Critical Limits (Chrome Web Store)
- **Description**: 132 characters max
- **Name**: 75 characters max  
- **Version**: x.y.z format only

---

*Last updated: 2025-09-05*
*Script version: Based on scripts/validate-chrome-extension.js*
*Current project status: All validations passing (117/132 desc, 45/75 name, v0.0.18)*