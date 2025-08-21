export const isValidUsherPhyloDescendant = (s: string): boolean => {
  return s.toLowerCase().startsWith('node_') && s.length > 5;
};
