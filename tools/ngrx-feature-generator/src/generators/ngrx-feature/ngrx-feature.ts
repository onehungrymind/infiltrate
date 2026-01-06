import {
  Tree,
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  readProjectConfiguration,
  readJson,
} from '@nx/devkit';
import { NgrxFeatureGeneratorSchema } from './schema';

export async function ngrxFeatureGenerator(
  tree: Tree,
  options: NgrxFeatureGeneratorSchema,
) {
  const {
    pluralName,
    singularName,
    project,
    skipTests = false,
    skipFormat = false,
  } = options;

  // Get the project configuration
  const projectConfig = readProjectConfiguration(tree, project);
  const projectRoot = projectConfig.root;

  // Extract npm scope from workspace package.json
  const packageJson = readJson(tree, 'package.json');
  const npmScope = packageJson.name?.match(/^@([^/]+)/)?.[1] || '';
  const npmScopePrefix = npmScope ? `@${npmScope}` : '';

  // Generate the feature names from the plural name
  const featureName = names(pluralName).fileName;
  const featureClassName = names(pluralName).className;

  // Convert names to proper formats for use in code
  const singularPropertyName = names(singularName).propertyName; // camelCase for parameter names
  const pluralPropertyName = names(pluralName).propertyName; // camelCase for parameter names

  // Automatically set the path to the plural name
  const targetPath = joinPathFragments(projectRoot, 'src', 'lib', pluralName);

  // Template variables for EJS templates
  const templateVariables = {
    featureName,
    featureClassName,
    singularPropertyName,
    pluralPropertyName,
    singularClassName: names(singularName).className,
    pluralClassName: names(pluralName).className,
    featureConstantName: featureName.toUpperCase(),
    featureTitleCase: featureClassName,
    featureKebabCase: featureName,
    featureCamelCase: pluralName,
    featurePascalCase: featureClassName,
    featureSnakeCase: featureName.replace(/-/g, '_'),
    featureScreamingSnakeCase: featureName.replace(/-/g, '_').toUpperCase(),
    npmScope: npmScopePrefix, // e.g., '@kasita' or '@articool'
  };

  // Generate the feature files
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    targetPath,
    templateVariables,
  );

  // Update the index.ts file to export the new feature
  const indexPath = joinPathFragments(projectRoot, 'src', 'index.ts');
  if (tree.exists(indexPath)) {
    const indexContent = tree.read(indexPath, 'utf-8');
    const newExports = `/* ${featureClassName} */
import * as ${featureClassName}Actions from './lib/${featureName}/${featureName}.actions';
import * as ${featureClassName}Feature from './lib/${featureName}/${featureName}.feature';
import * as ${featureClassName}Effects from './lib/${featureName}/${featureName}.effects';
import { ${featureClassName}Facade } from './lib/${featureName}/${featureName}.facade';
import { ${pluralPropertyName}Feature } from './lib/${featureName}/${featureName}.feature';

export {
  ${pluralPropertyName}Feature,
  ${featureClassName}Facade,
  ${featureClassName}Actions,
  ${featureClassName}Feature,
  ${featureClassName}Effects,
};
`;

    tree.write(indexPath, indexContent + '\n' + newExports);
  }

  if (!skipFormat) {
    await formatFiles(tree);
  }
}

export default ngrxFeatureGenerator;
