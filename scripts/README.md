# Scripts Directory

Utility scripts for the Kasita workspace.

## generate-file-structure.sh

Generates `guides/file-structure.txt` from the actual workspace directory structure.

### Usage

```bash
./scripts/generate-file-structure.sh
```

### Features

- Recursively scans the entire workspace structure
- Automatically excludes build/cache directories (node_modules, dist, .git, etc.)
- Adds helpful comments based on:
  - README.md files (first line)
  - package.json descriptions
  - Predefined directory name mappings
- Generates a tree-like visualization with proper indentation
- Outputs to `guides/file-structure.txt`

### Excluded Directories

The script automatically excludes:
- `node_modules`, `dist`, `.git`, `.nx`, `.angular`, `tmp`
- `__pycache__`, `.venv`, `.claude`, `coverage`, `.vscode`
- `uv.lock` and other build artifacts

### Customization

To modify the generated output:

1. **Add new directory comments**: Edit the `get_comment()` function case statement
2. **Change excluded directories**: Modify the `EXCLUDE_DIRS` variable
3. **Adjust depth**: The script currently scans all levels recursively

---

## generate-architecture-diagram.sh

Generates `guides/architecture-diagram.md` with a Mermaid diagram showing the workspace architecture and component relationships.

### Usage

```bash
./scripts/generate-architecture-diagram.sh
```

### Features

- Creates a comprehensive Mermaid architecture diagram
- Shows relationships between:
  - Angular applications (dashboard, infiltrate)
  - NestJS API
  - Python services (patchbay, synthesizer)
  - Shared libraries (common-models, core-data, core-state, material)
  - Custom generators (tools)
  - Data storage (raw, processed, synthesized, database)
- Includes data flow visualization
- Documents technology stack
- Provides component descriptions

### Output

The script generates a markdown file with:
- Mermaid diagram showing component relationships
- Component descriptions
- Technology stack information
- Data flow explanation
- Dependency relationships

### Customization

To modify the diagram:

1. **Add new components**: Edit the Mermaid diagram section in the script
2. **Change relationships**: Update the arrow connections (--> for solid, -.- for dashed)
3. **Update styles**: Modify the `style` commands to change colors
4. **Add descriptions**: Update the Component Descriptions section

