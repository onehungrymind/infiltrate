export interface NgrxFeatureGeneratorSchema {
  pluralName: string;
  singularName: string;
  project: string;
  skipTests?: boolean;
  skipFormat?: boolean;
}
