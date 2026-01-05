import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, joinPathFragments } from '@nx/devkit';
import { addProjectConfiguration } from '@nx/devkit';

import { ngHttpServiceGenerator } from './ng-http-service';
import { NgHttpServiceGeneratorSchema } from './schema';

describe('ng-http-service generator', () => {
  let tree: Tree;
  const projectName = 'test-lib';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    
    // Set up a test project
    addProjectConfiguration(tree, projectName, {
      root: `libs/${projectName}`,
      projectType: 'library',
      sourceRoot: `libs/${projectName}/src`,
    });
    
    // Create index.ts
    tree.write(
      joinPathFragments(`libs/${projectName}/src/index.ts`),
      '// Existing exports\n'
    );
  });

  describe('basic generation', () => {
    it('should generate service files correctly', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'users',
        singularName: 'user',
        project: projectName,
      };

      await ngHttpServiceGenerator(tree, options);

      // Verify service file exists
      const servicePath = joinPathFragments(
        `libs/${projectName}/src/lib/services/users/users.service.ts`
      );
      expect(tree.exists(servicePath)).toBe(true);

      // Verify test file exists
      const testPath = joinPathFragments(
        `libs/${projectName}/src/lib/services/users/users.service.spec.ts`
      );
      expect(tree.exists(testPath)).toBe(true);
    });

    it('should generate files with correct class names', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'products',
        singularName: 'product',
        project: projectName,
      };

      await ngHttpServiceGenerator(tree, options);

      const servicePath = joinPathFragments(
        `libs/${projectName}/src/lib/services/products/products.service.ts`
      );
      const content = tree.read(servicePath, 'utf-8');
      
      expect(content).toContain('export class ProductsService');
      expect(content).toContain('private http = inject(HttpClient)');
      expect(content).toContain('model = \'products\'');
      expect(content).toContain('Product');
    });

    it('should handle kebab-case names correctly', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'user-profiles',
        singularName: 'user-profile',
        project: projectName,
      };

      await ngHttpServiceGenerator(tree, options);

      const servicePath = joinPathFragments(
        `libs/${projectName}/src/lib/services/user-profiles/user-profiles.service.ts`
      );
      const content = tree.read(servicePath, 'utf-8');
      
      expect(content).toContain('export class UserProfilesService');
      expect(content).toContain('UserProfile');
      // Note: singularPropertyName uses singularName directly, so 'user-profile' is used as-is
      expect(content).toContain('user-profile');
    });
  });

  describe('skipTests flag', () => {
    it('should generate test file by default', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'orders',
        singularName: 'order',
        project: projectName,
      };

      await ngHttpServiceGenerator(tree, options);

      const testPath = joinPathFragments(
        `libs/${projectName}/src/lib/services/orders/orders.service.spec.ts`
      );
      expect(tree.exists(testPath)).toBe(true);
    });

    it('should skip test file when skipTests is true', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'orders',
        singularName: 'order',
        project: projectName,
        skipTests: true,
      };

      await ngHttpServiceGenerator(tree, options);

      const testPath = joinPathFragments(
        `libs/${projectName}/src/lib/services/orders/orders.service.spec.ts`
      );
      expect(tree.exists(testPath)).toBe(false);

      // Service file should still exist
      const servicePath = joinPathFragments(
        `libs/${projectName}/src/lib/services/orders/orders.service.ts`
      );
      expect(tree.exists(servicePath)).toBe(true);
    });
  });

  describe('index.ts updates', () => {
    it('should update index.ts with correct exports', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'categories',
        singularName: 'category',
        project: projectName,
      };

      await ngHttpServiceGenerator(tree, options);

      const indexPath = joinPathFragments(`libs/${projectName}/src/index.ts`);
      const content = tree.read(indexPath, 'utf-8');
      
      // serviceClassName is derived from pluralName, so 'categories' becomes 'Categories'
      expect(content).toContain('/* Categories */');
      expect(content).toContain('export * from \'./lib/services/categories/categories.service\'');
    });

    it('should append to existing index.ts content', async () => {
      const initialContent = 'export * from \'./lib/existing\';\n';
      tree.write(
        joinPathFragments(`libs/${projectName}/src/index.ts`),
        initialContent
      );

      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'tags',
        singularName: 'tag',
        project: projectName,
      };

      await ngHttpServiceGenerator(tree, options);

      const indexPath = joinPathFragments(`libs/${projectName}/src/index.ts`);
      const content = tree.read(indexPath, 'utf-8');
      
      expect(content).toContain('export * from \'./lib/existing\'');
      expect(content).toContain('export * from \'./lib/services/tags/tags.service\'');
    });

    it('should handle missing index.ts gracefully', async () => {
      tree.delete(joinPathFragments(`libs/${projectName}/src/index.ts`));

      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'comments',
        singularName: 'comment',
        project: projectName,
      };

      // Should not throw
      await expect(ngHttpServiceGenerator(tree, options)).resolves.not.toThrow();
      
      // Service files should still be generated
      const servicePath = joinPathFragments(
        `libs/${projectName}/src/lib/services/comments/comments.service.ts`
      );
      expect(tree.exists(servicePath)).toBe(true);
    });
  });

  describe('template variables', () => {
    it('should correctly substitute all template variables', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'articles',
        singularName: 'article',
        project: projectName,
      };

      await ngHttpServiceGenerator(tree, options);

      const servicePath = joinPathFragments(
        `libs/${projectName}/src/lib/services/articles/articles.service.ts`
      );
      const content = tree.read(servicePath, 'utf-8');
      
      // Verify class name
      expect(content).toContain('ArticlesService');
      // Verify singular class name
      expect(content).toContain('Article');
      // Verify property names
      expect(content).toContain('article: Article');
      // Verify model name
      expect(content).toContain('model = \'articles\'');
    });

    it('should generate test file with correct template variables', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'posts',
        singularName: 'post',
        project: projectName,
      };

      await ngHttpServiceGenerator(tree, options);

      const testPath = joinPathFragments(
        `libs/${projectName}/src/lib/services/posts/posts.service.spec.ts`
      );
      const content = tree.read(testPath, 'utf-8');
      
      expect(content).toContain('PostsService');
      expect(content).toContain('service.model');
      expect(content).toContain('\'posts\'');
    });
  });

  describe('skipFormat flag', () => {
    it('should run successfully with skipFormat true', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'items',
        singularName: 'item',
        project: projectName,
        skipFormat: true,
      };

      await expect(ngHttpServiceGenerator(tree, options)).resolves.not.toThrow();
      
      const servicePath = joinPathFragments(
        `libs/${projectName}/src/lib/services/items/items.service.ts`
      );
      expect(tree.exists(servicePath)).toBe(true);
    });
  });

  describe('error cases', () => {
    it('should throw error when project does not exist', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'users',
        singularName: 'user',
        project: 'non-existent-project',
      };

      await expect(ngHttpServiceGenerator(tree, options)).rejects.toThrow();
    });
  });

  describe('file structure', () => {
    it('should create files in correct directory structure', async () => {
      const options: NgHttpServiceGeneratorSchema = {
        pluralName: 'customers',
        singularName: 'customer',
        project: projectName,
      };

      await ngHttpServiceGenerator(tree, options);

      const expectedDir = joinPathFragments(
        `libs/${projectName}/src/lib/services/customers`
      );
      
      // Verify directory exists by checking files
      expect(tree.exists(joinPathFragments(expectedDir, 'customers.service.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(expectedDir, 'customers.service.spec.ts'))).toBe(true);
    });
  });
});
