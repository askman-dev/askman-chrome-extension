/**
 * Extracts all variable names used in a Handlebars template
 * Supports various variable formats:
 * - Simple variables: {{foo}}
 * - Dot notation: {{foo.bar}}
 * - Path notation: {{foo/bar}}
 * - @ variables: {{@foo}}
 * - Literal brackets: {{[foo bar]}}
 * - Quoted literals: {{"foo bar"}}
 * - If statements: {{#if foo}}...{{/if}}
 *
 * @param template The Handlebars template string to process
 * @returns A Set of all variable names used in the template
 * @throws Error if the template is invalid
 */
export const extractUsedVars = (template: string): Set<string> => {
  // Input validation
  if (typeof template !== 'string') {
    throw new Error('Template must be a string');
  }

  const usedVars = new Set<string>();
  const hbs = template;

  // Handle escaped variables first
  const escapedHbs = hbs.replace(/\\{{/g, '');

  // Validate template syntax
  const validateTemplate = (template: string) => {
    if (template.includes('{{  }}')) {
      throw new Error('Empty variable name found in template: {{  }}');
    }

    // Check for unmatched quotes in variables
    const quoteMatches = template.match(/{{[^}]*}}/g) || [];
    for (const match of quoteMatches) {
      const content = match.slice(2, -2).trim();
      const quotes = content.match(/["']/g) || [];
      if (quotes.length % 2 !== 0) {
        throw new Error('Failed to parse template: Unclosed quotes detected');
      }
    }

    const malformedBrackets = template.match(/{{[^}]*[[\]][^}]*}}/g) || [];
    for (const bracket of malformedBrackets) {
      if (!bracket.match(/{{[^}]*\[[^\]]+\][^}]*}}/)) {
        throw new Error('Failed to parse template: Malformed brackets detected');
      }
    }
  };

  // Validate the template
  validateTemplate(escapedHbs);

  // Match valid Handlebars variable expressions
  const ifRegex = /{{#if\s+([^}]+)}}/g;
  let ifMatch;
  while ((ifMatch = ifRegex.exec(escapedHbs)) !== null) {
    usedVars.add(ifMatch[1].trim());
  }

  // Match other variables
  const varRegex = /{{\s*(?!#)(?!\/)(if\s+)?(@?[\w\-./]+|\[[\w\s]+\]|"[^"]*"|'[^']*')\s*}}/g;
  let match;
  while ((match = varRegex.exec(escapedHbs)) !== null) {
    const varPart = match[0].slice(2, -2).trim(); // Remove {{ }}

    // Extract variable name
    let varName = varPart;

    // Handle if statement
    if (varName.startsWith('if ')) {
      varName = varName.slice(3);
    }
    // Handle @ variable
    if (varName.startsWith('@')) {
      varName = varName.slice(1);
    }
    // Handle literal brackets
    if (varName.startsWith('[') && varName.endsWith(']')) {
      varName = varName.slice(1, -1);
    }
    // Handle quoted literals
    if ((varName.startsWith('"') && varName.endsWith('"')) || (varName.startsWith("'") && varName.endsWith("'"))) {
      varName = varName.slice(1, -1);
    }

    // Add to used variables if not empty
    const trimmedVarName = varName.trim();
    if (trimmedVarName) {
      usedVars.add(trimmedVarName);
    } else {
      throw new Error(`Empty variable name found in template: ${match[0]}`);
    }
  }

  return usedVars;
};
