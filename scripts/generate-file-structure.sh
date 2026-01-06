#!/bin/bash

# Generate guides/file-structure.txt from actual workspace structure
# Usage: ./scripts/generate-file-structure.sh

set -euo pipefail

OUTPUT_FILE="guides/file-structure.txt"
EXCLUDE_DIRS="node_modules|dist|.git|.nx|.angular|tmp|__pycache__|\.venv|\.claude|coverage|\.vscode|uv\.lock"

# Colors for output (optional)
RESET='\033[0m'
GREEN='\033[0;32m'

echo -e "${GREEN}Generating ${OUTPUT_FILE} from workspace structure...${RESET}"

# Function to get comment for a directory
get_comment() {
    local dir="$1"
    local comment=""
    
    # Check for README files first
    if [ -f "$dir/README.md" ]; then
        # Extract first non-empty line of README as comment (skip title if it's # Title)
        comment=$(grep -v '^$' "$dir/README.md" | head -1 | sed 's/^#*\s*//' | sed 's/^\*\*\*//' | sed 's/\*\*\*$//' | head -c 60)
        if [ -n "$comment" ] && [ "$comment" != "#" ]; then
            echo "$comment"
            return
        fi
    fi
    
    # Check for package.json descriptions
    if [ -f "$dir/package.json" ]; then
        comment=$(grep -o '"description":\s*"[^"]*"' "$dir/package.json" 2>/dev/null | sed 's/.*"description":\s*"\([^"]*\)".*/\1/' | head -c 60 || echo "")
        if [ -n "$comment" ]; then
            echo "$comment"
            return
        fi
    fi
    
    # Use predefined comments based on directory name
    case "$(basename "$dir")" in
        api) echo "NestJS API" ;;
        dashboard) echo "Angular admin dashboard" ;;
        infiltrate) echo "Angular app" ;;
        patchbay) echo "Python content ingestion" ;;
        synthesizer) echo "Python content processing" ;;
        core-data) echo "Angular HTTP services" ;;
        core-state) echo "NgRx feature slices" ;;
        material) echo "Angular Material module" ;;
        python-shared) echo "Shared Python utilities" ;;
        common-models) echo "TypeScript models and types" ;;
        adapters) echo "Content adapters (RSS, Article, JS Weekly, etc.)" ;;
        models) echo "Pydantic models" ;;
        scripts) echo "Utility scripts" ;;
        src) 
            case "$(dirname "$dir")" in
                *patchbay*) echo "Main ingestion logic" ;;
                *synthesizer*) echo "Main orchestration" ;;
                *python-shared*) echo "File I/O, logging, utils" ;;
                *) echo "Source code" ;;
            esac
            ;;
        generators) echo "Code generators" ;;
        processors) echo "Embeddings, clustering" ;;
        knowledge-units|learning-paths|raw-content|source-configs|user-progress) echo "NgRx feature module" ;;
        raw) echo "Ingested content (one file per issue)" ;;
        processed) echo "Processed content" ;;
        synthesized) echo "Knowledge units" ;;
        *) echo "" ;;
    esac
}

# Function to build tree structure recursively
build_tree() {
    local base_dir="$1"
    local prefix="$2"
    local is_last="$3"
    
    local dir_name=$(basename "$base_dir")
    
    # Skip excluded directories
    if echo "$dir_name" | grep -qE "^($EXCLUDE_DIRS)$"; then
        return
    fi
    
    # Determine the tree characters
    if [ "$is_last" = "true" ]; then
        local current_prefix="${prefix}└── "
        local next_prefix="${prefix}    "
    else
        local current_prefix="${prefix}├── "
        local next_prefix="${prefix}│   "
    fi
    
    # Print directory with comment
    local comment=$(get_comment "$base_dir")
    if [ -n "$comment" ]; then
        echo "${current_prefix}${dir_name}                    # ${comment}"
    else
        echo "${current_prefix}${dir_name}"
    fi
    
    # Get subdirectories (excluding hidden dirs and excluded dirs)
    local subdirs_array=()
    while IFS= read -r -d '' subdir; do
        local subdir_name=$(basename "$subdir")
        if ! echo "$subdir_name" | grep -qE "^($EXCLUDE_DIRS)$" && ! echo "$subdir_name" | grep -q "^\."; then
            subdirs_array+=("$subdir")
        fi
    done < <(find "$base_dir" -maxdepth 1 -type d ! -path "$base_dir" -print0 2>/dev/null | sort -z)
    
    local count=${#subdirs_array[@]}
    if [ "$count" -eq 0 ]; then
        return
    fi
    
    # Recursively process subdirectories
    local index=0
    for subdir in "${subdirs_array[@]}"; do
        index=$((index + 1))
        if [ "$index" -eq "$count" ]; then
            build_tree "$subdir" "$next_prefix" "true"
        else
            build_tree "$subdir" "$next_prefix" "false"
        fi
    done
}

# Start generating the file
{
    echo "kasita/"
    
    # Process top-level directories in order
    top_dirs=("apps" "libs" "tools" "data")
    top_dir_count=${#top_dirs[@]}
    top_index=0
    
    for top_dir in "${top_dirs[@]}"; do
        top_index=$((top_index + 1))
        if [ -d "$top_dir" ]; then
            # Check if this is the last top-level directory
            is_last="false"
            if [ "$top_index" -eq "$top_dir_count" ]; then
                is_last="true"
            fi
            
            if [ "$is_last" = "true" ]; then
                build_tree "$top_dir" "" "true"
            else
                build_tree "$top_dir" "" "false"
            fi
        fi
    done
} > "$OUTPUT_FILE"

echo -e "${GREEN}✅ Generated ${OUTPUT_FILE}${RESET}"
echo "   File size: $(wc -l < "$OUTPUT_FILE") lines"
echo "   Location: $(pwd)/${OUTPUT_FILE}"
