import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { masterDetailViewGenerator } from './master-detail-view';
import { MasterDetailViewGeneratorSchema } from './schema';

describe('master-detail-view generator', () => {
  let tree: Tree;
  const options: MasterDetailViewGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await masterDetailViewGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
