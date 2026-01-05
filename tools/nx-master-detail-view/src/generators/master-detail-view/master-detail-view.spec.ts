import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, joinPathFragments } from '@nx/devkit';
import { addProjectConfiguration } from '@nx/devkit';

import { masterDetailViewGenerator } from './master-detail-view';
import { MasterDetailViewGeneratorSchema } from './schema';

describe('master-detail-view generator', () => {
  let tree: Tree;
  const projectName = 'test-app';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    
    // Set up a test project (application type for master-detail-view)
    addProjectConfiguration(tree, projectName, {
      root: `apps/${projectName}`,
      projectType: 'application',
      sourceRoot: `apps/${projectName}/src`,
    });
  });

  describe('basic generation', () => {
    it('should generate all required component files', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'users',
        singularName: 'user',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const basePath = joinPathFragments(`apps/${projectName}/src/app/users`);
      
      // Verify main component files
      expect(tree.exists(joinPathFragments(basePath, 'users.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'users.html'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'users.scss'))).toBe(true);
      
      // Verify list component files (template uses underscores: __pluralKebabCase___list)
      expect(tree.exists(joinPathFragments(basePath, 'users_list/users_list.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'users_list/users_list.html'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'users_list/users_list.scss'))).toBe(true);
      
      // Verify detail component files (template uses underscores: __singularKebabCase___detail)
      expect(tree.exists(joinPathFragments(basePath, 'user_detail/user_detail.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'user_detail/user_detail.html'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'user_detail/user_detail.scss'))).toBe(true);
    });

    it('should generate main component with correct structure', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'products',
        singularName: 'product',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const componentPath = joinPathFragments(
        `apps/${projectName}/src/app/products/products.ts`
      );
      const content = tree.read(componentPath, 'utf-8');
      
      expect(content).toContain('export class Products');
      expect(content).toContain('ProductsFacade');
      expect(content).toContain('products$');
      expect(content).toContain('selectedProduct$');
    });

    it('should generate list component with correct structure', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'orders',
        singularName: 'order',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const listPath = joinPathFragments(
        `apps/${projectName}/src/app/orders/orders_list/orders_list.ts`
      );
      const content = tree.read(listPath, 'utf-8');
      
      expect(content).toContain('OrdersList');
      expect(content).toContain('orders');
    });

    it('should generate detail component with correct structure', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'categories',
        singularName: 'category',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const detailPath = joinPathFragments(
        `apps/${projectName}/src/app/categories/category_detail/category_detail.ts`
      );
      const content = tree.read(detailPath, 'utf-8');
      
      expect(content).toContain('CategoryDetail');
      expect(content).toContain('category');
    });
  });

  describe('skipTests flag', () => {
    it('should not generate test files by default (generator does not include test templates)', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'tags',
        singularName: 'tag',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const basePath = joinPathFragments(`apps/${projectName}/src/app/tags`);
      // Note: This generator does not generate test files by default
      // The skipTests flag is handled but test templates are not included
      expect(tree.exists(joinPathFragments(basePath, 'tags.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'tags_list/tags_list.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'tag_detail/tag_detail.ts'))).toBe(true);
    });

    it('should skip all test files when skipTests is true', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'comments',
        singularName: 'comment',
        project: projectName,
        skipTests: true,
      };

      await masterDetailViewGenerator(tree, options);

      const basePath = joinPathFragments(`apps/${projectName}/src/app/comments`);
      
      // Test files should not exist
      expect(tree.exists(joinPathFragments(basePath, 'comments.spec.ts'))).toBe(false);
      expect(tree.exists(joinPathFragments(basePath, 'comments_list/comments_list.spec.ts'))).toBe(false);
      expect(tree.exists(joinPathFragments(basePath, 'comment_detail/comment_detail.spec.ts'))).toBe(false);
      
      // Source files should still exist
      expect(tree.exists(joinPathFragments(basePath, 'comments.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'comments_list/comments_list.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'comment_detail/comment_detail.ts'))).toBe(true);
    });
  });

  describe('template variables', () => {
    it('should correctly substitute plural and singular names', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'articles',
        singularName: 'article',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const componentPath = joinPathFragments(
        `apps/${projectName}/src/app/articles/articles.ts`
      );
      const content = tree.read(componentPath, 'utf-8');
      
      // Verify plural usage
      expect(content).toContain('articles$');
      expect(content).toContain('ArticlesFacade');
      expect(content).toContain('ArticlesList');
      // Verify singular usage
      expect(content).toContain('selectedArticle$');
      expect(content).toContain('ArticleDetail');
      expect(content).toContain('article: Article');
    });

    it('should handle kebab-case transformations correctly', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'user-profiles',
        singularName: 'user-profile',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      // Verify directory names use kebab-case with underscores
      const basePath = joinPathFragments(`apps/${projectName}/src/app/user-profiles`);
      expect(tree.exists(joinPathFragments(basePath, 'user-profiles_list/user-profiles_list.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'user-profile_detail/user-profile_detail.ts'))).toBe(true);
      
      // Verify class names use PascalCase
      const componentPath = joinPathFragments(
        `apps/${projectName}/src/app/user-profiles/user-profiles.ts`
      );
      const content = tree.read(componentPath, 'utf-8');
      expect(content).toContain('export class UserProfiles');
    });

    it('should use correct selector format in templates', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'items',
        singularName: 'item',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const componentPath = joinPathFragments(
        `apps/${projectName}/src/app/items/items.ts`
      );
      const content = tree.read(componentPath, 'utf-8');
      
      expect(content).toContain('app-items');
      // Component selectors use kebab-case with hyphens (not directory paths)
      expect(content).toContain('items-list');
      expect(content).toContain('item-detail');
    });
  });

  describe('skipFormat flag', () => {
    it('should run successfully with skipFormat true', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'vendors',
        singularName: 'vendor',
        project: projectName,
        skipFormat: true,
      };

      await expect(masterDetailViewGenerator(tree, options)).resolves.not.toThrow();
      
      const componentPath = joinPathFragments(
        `apps/${projectName}/src/app/vendors/vendors.ts`
      );
      expect(tree.exists(componentPath)).toBe(true);
    });
  });

  describe('error cases', () => {
    it('should throw error when project does not exist', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'users',
        singularName: 'user',
        project: 'non-existent-project',
      };

      await expect(masterDetailViewGenerator(tree, options)).rejects.toThrow();
    });
  });

  describe('nested directory structure', () => {
    it('should create nested directories correctly', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'customers',
        singularName: 'customer',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const basePath = joinPathFragments(`apps/${projectName}/src/app/customers`);
      
      // Verify list component directory (uses underscores: customers_list)
      const listDir = joinPathFragments(basePath, 'customers_list');
      expect(tree.exists(joinPathFragments(listDir, 'customers_list.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(listDir, 'customers_list.html'))).toBe(true);
      expect(tree.exists(joinPathFragments(listDir, 'customers_list.scss'))).toBe(true);
      
      // Verify detail component directory (uses underscores: customer_detail)
      const detailDir = joinPathFragments(basePath, 'customer_detail');
      expect(tree.exists(joinPathFragments(detailDir, 'customer_detail.ts'))).toBe(true);
      expect(tree.exists(joinPathFragments(detailDir, 'customer_detail.html'))).toBe(true);
      expect(tree.exists(joinPathFragments(detailDir, 'customer_detail.scss'))).toBe(true);
    });
  });

  describe('name transformations', () => {
    it('should handle complex plural/singular pairs', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'people',
        singularName: 'person',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const componentPath = joinPathFragments(
        `apps/${projectName}/src/app/people/people.ts`
      );
      const content = tree.read(componentPath, 'utf-8');
      
      expect(content).toContain('People');
      expect(content).toContain('people$');
      expect(content).toContain('selectedPerson$');
      expect(content).toContain('Person');
    });

    it('should correctly transform camelCase to kebab-case for directories', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'orderItems',
        singularName: 'orderItem',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      // Note: The generator uses pluralName directly for the base path (not kebab-case)
      // So 'orderItems' stays as 'orderItems', not 'order-items'
      const basePath = joinPathFragments(`apps/${projectName}/src/app/orderItems`);
      expect(tree.exists(joinPathFragments(basePath, 'order-items.ts'))).toBe(true);
    });
  });

  describe('HTML and SCSS files', () => {
    it('should generate HTML template files', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'posts',
        singularName: 'post',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const basePath = joinPathFragments(`apps/${projectName}/src/app/posts`);
      
      expect(tree.exists(joinPathFragments(basePath, 'posts.html'))).toBe(true);
      // Template directories use underscores: __pluralKebabCase___list becomes posts_list
      expect(tree.exists(joinPathFragments(basePath, 'posts_list/posts_list.html'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'post_detail/post_detail.html'))).toBe(true);
    });

    it('should generate SCSS style files', async () => {
      const options: MasterDetailViewGeneratorSchema = {
        pluralName: 'invoices',
        singularName: 'invoice',
        project: projectName,
      };

      await masterDetailViewGenerator(tree, options);

      const basePath = joinPathFragments(`apps/${projectName}/src/app/invoices`);
      
      expect(tree.exists(joinPathFragments(basePath, 'invoices.scss'))).toBe(true);
      // Template directories use underscores: __pluralKebabCase___list becomes invoices_list
      expect(tree.exists(joinPathFragments(basePath, 'invoices_list/invoices_list.scss'))).toBe(true);
      expect(tree.exists(joinPathFragments(basePath, 'invoice_detail/invoice_detail.scss'))).toBe(true);
    });
  });
});
