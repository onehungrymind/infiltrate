import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { ngHttpServiceGenerator } from './ng-http-service';
import { NgHttpServiceGeneratorSchema } from './schema';

describe('ng-http-service generator', () => {
  let tree: Tree;
  const options: NgHttpServiceGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await ngHttpServiceGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
