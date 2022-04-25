import { useExploreUrl } from '../helpers/explore-url';
import ReactTooltip from 'react-tooltip';

type dataProps = {
  data: { onlyVariant1: string[]; onlyVariant2: string[]; shared: string[]; gene: string }[];
};

export const SvgVariantComparison2 = (props: dataProps) => {
  const exploreUrl = useExploreUrl()!;
  const variants = exploreUrl.variants;

  let allMutations: { variant1Mutations: string[]; variant2Mutations: string[]; shared: string[] } = {
    variant1Mutations: [],
    variant2Mutations: [],
    shared: [],
  };

  for (const item of props.data) {
    allMutations.variant1Mutations.push(...item.onlyVariant1);
    allMutations.variant2Mutations.push(...item.onlyVariant2);
    allMutations.shared.push(...item.shared);
  }

  return (
    <>
      <svg
        width='500'
        height='500'
        version='1.1'
        id='Layer_1'
        x='0px'
        y='0px'
        viewBox='0 0 910 577'
        xmlns='http://www.w3.org/2000/svg'
        className='svgPlot'
        {...props}
      >
        <g>
          <path
            className='st0'
            d='M562.05,172.22c15.54,36.74,23.42,75.75,23.42,115.97s-7.88,79.24-23.42,115.97 c-15.01,35.48-36.49,67.34-63.85,94.7c-9.07,9.07-18.64,17.49-28.67,25.25c44.2,28.87,96.96,45.67,153.58,45.67 c155.27,0,281.59-126.32,281.59-281.59S778.39,6.61,623.12,6.61c-56.62,0-109.38,16.8-153.58,45.67 c10.03,7.76,19.6,16.18,28.67,25.25C525.57,104.88,547.05,136.75,562.05,172.22z'
          />
          <path
            className='st0'
            d='M348.61,404.17c-15.54-36.74-23.42-75.75-23.42-115.97c0-40.22,7.88-79.23,23.42-115.97 c15.01-35.48,36.49-67.34,63.85-94.7c9.07-9.07,18.64-17.49,28.67-25.25c-44.2-28.87-96.96-45.67-153.58-45.67 C132.27,6.61,5.95,132.93,5.95,288.19s126.32,281.59,281.59,281.59c56.62,0,109.38-16.8,153.58-45.67 c-10.03-7.76-19.6-16.18-28.67-25.25C385.09,471.5,363.61,439.64,348.61,404.17z'
          />
          <path
            className='st0'
            d='M569.13,288.19c0-92.45-44.78-174.63-113.8-226c-69.01,51.37-113.8,133.55-113.8,226s44.78,174.63,113.8,226 C524.34,462.83,569.13,380.64,569.13,288.19z'
          />
        </g>
        <text
          transform='matrix(1 0 0 1 154.6328 294.3799)'
          className='st1 st2 svgPlotNumber'
          data-for='variant1'
          data-tip
        >
          {allMutations.variant1Mutations.length}
        </text>
        <text
          transform='matrix(1 0 0 1 427.6328 294.3799)'
          className='st1 st2 svgPlotNumber'
          data-for='shared'
          data-tip
        >
          {allMutations.shared.length}
        </text>
        <text
          transform='matrix(1 0 0 1 712.6328 294.3799)'
          className='st1 st2 svgPlotNumber'
          data-for='variant2'
          data-tip
        >
          {allMutations.variant2Mutations.length}
        </text>
        <text x='8.785' y='37.948' className='svgPlotText'>
          {variants ? variants[0].pangoLineage : null}
        </text>
        <text x='777.125' y='31.79' className='svgPlotText'>
          {variants ? variants[1].pangoLineage : null}
        </text>
      </svg>
      <>
        <ReactTooltip id='variant1' key='variant1'>
          {allMutations.variant1Mutations.length
            ? MutationListFormat(allMutations.variant1Mutations)
            : `no mutations in ${variants ? variants[0].pangoLineage : null}`}
        </ReactTooltip>
        <ReactTooltip id='shared' key='shared'>
          {allMutations.shared.length ? MutationListFormat(allMutations.shared) : 'no shared mutations'}
        </ReactTooltip>
        <ReactTooltip id='variant2' key='variant2'>
          {allMutations.variant2Mutations.length
            ? MutationListFormat(allMutations.variant2Mutations)
            : `no mutations in ${variants ? variants[1].pangoLineage : null}`}
        </ReactTooltip>
      </>
    </>
  );
};

function MutationListFormat(mutations: string[]): JSX.Element {
  // Up to five mutations shall be shown on a line.
  let currentLine: string[] = [];
  const lines: string[][] = [currentLine];
  for (let mutation of mutations.sort()) {
    currentLine.push(mutation);
    if (currentLine.length >= 5) {
      currentLine = [];
      lines.push(currentLine);
    }
  }
  return (
    <>
      {lines.map((line, index) => (
        <div key={index}>{line.join(', ')}</div>
      ))}
    </>
  );
}
