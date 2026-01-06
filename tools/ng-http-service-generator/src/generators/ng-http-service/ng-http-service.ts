import { Tree, formatFiles, generateFiles, joinPathFragments, names, readProjectConfiguration, readJson } from '@nx/devkit';
import { NgHttpServiceGeneratorSchema } from './schema';

export async function ngHttpServiceGenerator(
  tree: Tree,
  options: NgHttpServiceGeneratorSchema
) {
  const { pluralName, singularName, project, skipTests = false, skipFormat = false } = options;
  
  // Get the project configuration
  const projectConfig = readProjectConfiguration(tree, project);
  const projectRoot = projectConfig.root;
  
  // Extract npm scope from workspace package.json
  const packageJson = readJson(tree, 'package.json');
  const npmScope = packageJson.name?.match(/^@([^/]+)/)?.[1] || '';
  const npmScopePrefix = npmScope ? `@${npmScope}` : '';
  
  // Generate the service names from the plural name
  const serviceName = names(pluralName).fileName;
  const serviceClassName = names(pluralName).className;
  
  // Convert names to proper formats for use in code
  const singularPropertyName = names(singularName).propertyName; // camelCase for parameter names
  const pluralPropertyName = names(pluralName).propertyName; // camelCase for parameter names
  
  // Automatically set the path to the services directory
  const targetPath = joinPathFragments(projectRoot, 'src', 'lib', 'services', pluralName);
  
  // Template variables for EJS templates
  const templateVariables = {
    serviceName,
    serviceClassName,
    singularPropertyName,
    pluralPropertyName,
    singularClassName: names(singularName).className,
    pluralClassName: names(pluralName).className,
    serviceConstantName: serviceName.toUpperCase(),
    serviceTitleCase: serviceClassName,
    serviceKebabCase: serviceName,
    serviceCamelCase: pluralName,
    servicePascalCase: serviceClassName,
    serviceSnakeCase: serviceName.replace(/-/g, '_'),
    serviceScreamingSnakeCase: serviceName.replace(/-/g, '_').toUpperCase(),
    npmScope: npmScopePrefix, // e.g., '@kasita' or '@articool'
    skipTests,
  };

  // Generate the service files
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    targetPath,
    templateVariables
  );

  // Remove any .DS_Store files that may have been copied (macOS system files)
  const dsStorePath = joinPathFragments(targetPath, '.DS_Store');
  if (tree.exists(dsStorePath)) {
    tree.delete(dsStorePath);
  }

  // Remove test file if skipTests is true
  if (skipTests) {
    const testFilePath = joinPathFragments(targetPath, `${serviceName}.service.spec.ts`);
    if (tree.exists(testFilePath)) {
      tree.delete(testFilePath);
    }
  }

  // Update the index.ts file to export the new service
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

export default ngHttpServiceGenerator;
