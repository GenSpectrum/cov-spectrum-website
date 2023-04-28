import { PositionEntropy, PositionProportion } from './CalculateEntropy';
import { Gene, options } from './NucleotideEntropy';
import { decodeAAMutation } from '../../helpers/aa-mutation';
import { SequenceType } from '../../data/SequenceType';
import { Rectangle, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active) {
    return (
      <div className='recharts-tooltip-wrapper recharts-tooltip-wrapper-left recharts-tooltip-wrapper-top custom-tooltip'>
        <p style={{ paddingLeft: 10 }} className='label'>
          Position: <b>{label}</b>
        </p>
        <p style={{ paddingLeft: 10 }}>
          Entropy: <b>{Number(payload?.[0].value).toFixed(5)}</b>
        </p>

        <p style={{ paddingLeft: 10, paddingRight: 10 }}>Proportions:</p>
        {payload?.[0].payload?.proportions.map((pld: any) => (
          <div style={{ display: 'inline-block', paddingLeft: 10, paddingRight: 10, paddingBottom: 10 }}>
            <div>
              <b>{pld.mutation}</b> : {pld.proportion.toFixed(5)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const getBrushIndex = (
  gene: Gene | undefined,
  plotData: PositionEntropy[],
  sequenceType: SequenceType
): { startIndex: number; stopIndex: number } => {
  let startIndex;
  let stopIndex;
  if (sequenceType === 'aa') {
    let names = plotData.map(p => decodeAAMutation(p.position).gene);
    startIndex = gene?.name !== 'All' && gene?.name !== undefined ? names.indexOf(gene.name) : 0;
    stopIndex =
      gene?.name !== 'All' && gene?.name !== undefined ? names.lastIndexOf(gene.name) : plotData.length - 1;
  } else {
    startIndex =
      gene?.name !== 'All' && gene?.startPosition !== undefined
        ? plotData.findIndex(p => parseInt(p.position) > gene.startPosition)
        : 0;
    stopIndex =
      gene?.name !== 'All' && gene?.endPosition !== undefined
        ? plotData.findIndex(p => parseInt(p.position) > gene.endPosition) - 1
        : plotData.length - 1;
  }
  return { startIndex: startIndex, stopIndex: stopIndex };
};

export function formatXAxis(value: any) {
  return value.toString().includes(':') ? decodeAAMutation(value).position : value;
}

export const CustomBar = (props: PositionProportion) => {
  return (
    <Rectangle
      {...props}
      fill={
        props.position.includes(':')
          ? options.find(o => decodeAAMutation(props.position).gene.includes(o.label))?.color
          : options.find(
              o => o.startPosition <= parseInt(props.position) && parseInt(props.position) < o.endPosition
            )?.color
      }
    />
  );
};
