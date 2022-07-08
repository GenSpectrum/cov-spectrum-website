export type Collection = {
  id: number;
  title: string;
  description: string;
  maintainers: string;
  email: string;
  variants: CollectionVariant[];
};

export type CollectionVariant = {
  query: string;
  name: string;
  description: string;
};

export type CreateCollectionRequest = Omit<Collection, 'id'>;
