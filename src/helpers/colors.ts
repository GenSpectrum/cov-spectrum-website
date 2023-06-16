import chroma from 'chroma-js';

// These colors are also used by ppretty
export const pprettyColors = [
  '#353B89',
  '#3B8935',
  '#F0A21A',
  '#CE1A39',
  '#F7D233',
  '#A21AF0',
  '#21A0A1',
  '#898335',
  '#A76660',
  '#B8D4DC',
  '#F57E3B',
  '#DB598A',
];

const getRandomColor = () => chroma.random().darken().hex();

/**
 * Colors will be assigned to the labels in alphabetical order. Given [bbb, aaa, ccc], this function will
 * return [2nd color, 1st color, 3rd color]. It will first use the pprettyColors. If there are more labels
 * than pprettyColors, randomly generated colors will be used for the later labels.
 */
export const mapLabelsToColors = (labels: string[]): string[] => {
  const sorted = [...labels].sort();
  const labelToColorMap = new Map<string, string>();
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    if (i < pprettyColors.length) {
      labelToColorMap.set(s, pprettyColors[i]);
    } else {
      labelToColorMap.set(s, getRandomColor());
    }
  }
  return labels.map(l => labelToColorMap.get(l)!);
};
