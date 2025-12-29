import { Tree, formatFiles, generateFiles, joinPathFragments, names, readProjectConfiguration } from '@nx/devkit';
import { MasterDetailViewGeneratorSchema } from './schema';

export async function masterDetailViewGenerator(
  tree: Tree,
  options: MasterDetailViewGeneratorSchema
) {
  const { pluralName, singularName, project, skipTests = false, skipFormat = false } = options;
  
  // Get the project configuration
  const projectConfig = readProjectConfiguration(tree, project);
  const projectRoot = projectConfig.root;
  
  // Generate the feature names from the plural name
  const featureName = names(pluralName).fileName;
  const featureClassName = names(pluralName).className;
  const singularKebabCase = names(singularName).fileName;
  const pluralKebabCase = names(pluralName).fileName;
  
  // Use the provided singular and plural names directly
  const singularPropertyName = singularName;
  const pluralPropertyName = pluralName;
  
  // Automatically set the path to the feature directory
  const targetPath = joinPathFragments(projectRoot, 'src', 'app', pluralName);
  
  // Template variables for EJS templates
  const templateVariables = {
    featureName,
    featureClassName,
    featureKebabCase: featureName,
    singularPropertyName,
    pluralPropertyName,
    singularClassName: names(singularName).className,
    pluralClassName: names(pluralName).className,
    singularKebabCase,
    pluralKebabCase,
    skipTests,
  };

  // Generate the feature files
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    targetPath,
    templateVariables
  );

  // Remove test files if skipTests is true
  if (skipTests) {
    const testFiles = [
      joinPathFragments(targetPath, `${featureName}.spec.ts`),
      joinPathFragments(targetPath, `${pluralKebabCase}-list`, `${pluralKebabCase}-list.spec.ts`),
      joinPathFragments(targetPath, `${singularKebabCase}-detail`, `${singularKebabCase}-detail.spec.ts`),
    ];
    
    testFiles.forEach(testFile => {
      if (tree.exists(testFile)) {
        tree.delete(testFile);
      }
    });
  }

  if (!skipFormat) {
    await formatFiles(tree);
  }
}

export default masterDetailViewGenerator;
