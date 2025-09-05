#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chrome Web Store limits
const DESCRIPTION_MAX_LENGTH = 132;
const NAME_MAX_LENGTH = 75;

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateChromeExtension() {
  let hasErrors = false;

  try {
    // Read locale files
    const localesPath = join(__dirname, '../public/_locales');
    const enMessagesPath = join(localesPath, 'en/messages.json');

    log('blue', '🔍 Validating Chrome Extension metadata...');

    // Parse English messages
    const enMessages = JSON.parse(readFileSync(enMessagesPath, 'utf8'));

    // Validate extension description
    if (enMessages.extensionDescription?.message) {
      const description = enMessages.extensionDescription.message;
      const descLength = description.length;

      if (descLength > DESCRIPTION_MAX_LENGTH) {
        hasErrors = true;
        log('red', `❌ Extension description is too long: ${descLength} characters (max: ${DESCRIPTION_MAX_LENGTH})`);
        log('red', `   Description: "${description}"`);
        log('yellow', `   Exceeds by: ${descLength - DESCRIPTION_MAX_LENGTH} characters`);
      } else {
        log('green', `✅ Extension description length OK: ${descLength}/${DESCRIPTION_MAX_LENGTH} characters`);
      }
    } else {
      hasErrors = true;
      log('red', '❌ Extension description not found in messages.json');
    }

    // Validate extension name
    if (enMessages.extensionName?.message) {
      const name = enMessages.extensionName.message;
      const nameLength = name.length;

      if (nameLength > NAME_MAX_LENGTH) {
        hasErrors = true;
        log('red', `❌ Extension name is too long: ${nameLength} characters (max: ${NAME_MAX_LENGTH})`);
        log('red', `   Name: "${name}"`);
        log('yellow', `   Exceeds by: ${nameLength - NAME_MAX_LENGTH} characters`);
      } else {
        log('green', `✅ Extension name length OK: ${nameLength}/${NAME_MAX_LENGTH} characters`);
      }
    } else {
      hasErrors = true;
      log('red', '❌ Extension name not found in messages.json');
    }

    // Check if package.json version matches expected patterns
    const packagePath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    const version = packageJson.version;

    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      hasErrors = true;
      log('red', `❌ Package version format invalid: ${version} (expected: x.y.z)`);
    } else {
      log('green', `✅ Package version format OK: ${version}`);
    }
  } catch (error) {
    hasErrors = true;
    log('red', `❌ Error reading files: ${error.message}`);
  }

  if (hasErrors) {
    log('red', '\n💥 Chrome Extension validation failed!');
    log('yellow', '📝 Fix the issues above before building for Chrome Web Store');
    process.exit(1);
  } else {
    log('green', '\n✅ All Chrome Extension validations passed!');
  }
}

// Run validation
validateChromeExtension();
