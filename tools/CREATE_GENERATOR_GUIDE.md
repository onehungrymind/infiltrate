# Creating Nx Generators - Step-by-Step Guide

This guide provides precise instructions for creating custom Nx generators using the official plugin approach. Follow these steps exactly to create generators that follow current best practices.

## Prerequisites

- Nx workspace with `@nx/plugin` package installed
- Understanding of the target code patterns you want to generate
- Access to reference files for templates

## Step 1: Create the Plugin

Use the official Nx command to create a new plugin:

```bash
nx generate @nx/plugin:plugin [generator-name] --directory=tools/[generator-name]
```

**Example:**
```bash
nx generate @nx/plugin:plugin my-custom-generator --directory=tools/my-custom-generator
```

This creates the plugin structure in `tools/[generator-name]/` with:
- `src/index.ts` - Plugin entry point
- `package.json` - Plugin configuration
- `generators.json` - Generator registration
- Standard TypeScript and testing configuration files

## Step 2: Add a Generator to the Plugin

Use the official Nx command to add a generator:

```bash
nx generate @nx/plugin:generator tools/[generator-name]/src/generators/[generator-name] --name=[generator-name]
```

**Example:**
```bash
nx generate @nx/plugin:generator tools/my-custom-generator/src/generators/my-custom-generator --name=my-custom-generator
```

This creates:
- `src/generators/[generator-name]/[generator-name].ts` - Generator logic
- `src/generators/[generator-name]/schema.json` - Parameter definitions
- `src/generators/[generator-name]/schema.d.ts` - TypeScript interface
- `src/generators/[generator-name]/files/` - Template directory

## Step 3: Define the Schema

Update `src/generators/[generator-name]/schema.json` with your parameters:

```json
{
  "$schema": "https://json-schema.org/schema",
  "$id": "[GeneratorName]",
  "title": "[Generator Title]",
  "description": "[Generator description]",
  "type": "object",
  "properties": {
    "paramName": {
      "type": "string",
      "description": "Parameter description",
      "pattern": "^[a-z][a-z0-9-]*$",
      "x-prompt": "Prompt text for user"
    },
    "skipTests": {
      "type": "boolean",
      "description": "Skip generating test files",
      "default": false
    },
    "skipFormat": {
      "type": "boolean", 
      "description": "Skip formatting files",
      "default": false
    }
  },
  "required": ["paramName"]
}
```

Update `src/generators/[generator-name]/schema.d.ts`:

```typescript
export interface [GeneratorName]GeneratorSchema {
  paramName: string;
  skipTests?: boolean;
  skipFormat?: boolean;
}
```

## Step 4: Create Template Files

Create template files in `src/generators/[generator-name]/files/`:

- Use EJS template syntax: `<%= variableName %>`
- Use double underscores for file naming: `__fileName__.ts`
- Follow the patterns from existing reference files

**Template Example (`__serviceName__.service.ts`):**
```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class <%= serviceClassName %>Service {
  // Template content using <%= variables %>
}
```

## Step 5: Implement Generator Logic

Update `src/generators/[generator-name]/[generator-name].ts`:

```typescript
import { Tree, formatFiles, generateFiles, joinPathFragments, names, readProjectConfiguration } from '@nx/devkit';
import { [GeneratorName]GeneratorSchema } from './schema';

export async function [generatorName]Generator(
  tree: Tree,
  options: [GeneratorName]GeneratorSchema
) {
  const { paramName, skipTests = false, skipFormat = false } = options;
  
  // Get project configuration
  const projectConfig = readProjectConfiguration(tree, project);
  const projectRoot = projectConfig.root;
  
  // Generate names from parameters
  const serviceName = names(paramName).fileName;
  const serviceClassName = names(paramName).className;
  
  // Set target path
  const targetPath = joinPathFragments(projectRoot, 'src', 'lib', 'services', paramName);
  
  // Template variables for EJS
  const templateVariables = {
    serviceName,
    serviceClassName,
    paramName,
    skipTests,
    // Add other variables as needed
  };

  // Generate files
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    targetPath,
    templateVariables
  );

  // Handle skipTests flag
  if (skipTests) {
    const testFilePath = joinPathFragments(targetPath, `${serviceName}.service.spec.ts`);
    if (tree.exists(testFilePath)) {
      tree.delete(testFilePath);
    }
  }

  // Update index.ts exports
  const indexPath = joinPathFragments(projectRoot, 'src', 'index.ts');
  if (tree.exists(indexPath)) {
    const indexContent = tree.read(indexPath, 'utf-8');
    const newExports = `/* ${serviceClassName} */
export * from './lib/services/${serviceName}/${serviceName}.service';
`;
    tree.write(indexPath, indexContent + '\n' + newExports);
  }

  if (!skipFormat) {
    await formatFiles(tree);
  }
}

export default [generatorName]Generator;
```

## Step 6: Register the Plugin

Add the plugin to `nx.json`:

```json
{
  "plugins": [
    {
      "plugin": "./tools/[generator-name]/src/index.ts",
      "options": {}
    }
  ]
}
```

## Step 7: Test the Generator

1. **Verify recognition:**
```bash
nx list @articool/[generator-name]
```

2. **Dry run test:**
```bash
nx generate @articool/[generator-name]:[generator-name] --paramName=test --project=target-project --dry-run
```

3. **Full test:**
```bash
nx generate @articool/[generator-name]:[generator-name] --paramName=test --project=target-project --skipTests=true
```

## Step 8: Verify Output

Check that generated files:
- Are in the correct location
- Follow the reference patterns
- Include proper imports and exports
- Respect the skipTests flag
- Update index.ts exports

## Key Patterns to Follow

### File Naming
- Generator files: `[generator-name].ts`
- Template files: `__fileName__.ts`
- Use kebab-case for generator names
- Use PascalCase for class names in templates

### Template Variables
- Use `names()` utility for consistent naming
- Provide all necessary template variables
- Use descriptive variable names

### Error Handling
- Always check if files exist before operations
- Handle optional parameters with defaults
- Implement skipTests functionality consistently

### Paths
- Use `joinPathFragments()` for path construction
- Reference `__dirname` for template file locations
- Use project configuration for target paths

## Troubleshooting

### Generator Not Recognized
- Check `nx.json` plugin registration
- Verify `generators.json` paths are correct
- Ensure all files are in the right locations

### Template Errors
- Check EJS syntax in template files
- Verify all template variables are defined
- Test with simple templates first

### Path Issues
- Use `joinPathFragments()` consistently
- Check project configuration exists
- Verify target directories exist

## Reference Examples

- **HTTP Service Generator:** `tools/ng-http-service-generator/`
- **NgRx Feature Generator:** `tools/ngrx-feature-generator/`

Both generators follow this exact pattern and can be used as reference implementations.
