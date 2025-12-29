import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { ngrxFeatureGenerator } from './ngrx-feature';
import { NgrxFeatureGeneratorSchema } from './schema';

describe('ngrx-feature generator', () => {
  let tree: Tree;
  const options: NgrxFeatureGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await ngrxFeatureGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
