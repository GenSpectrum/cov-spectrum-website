import { MutationProportionEntry } from '../../data/MutationProportionEntry';
import { SequenceType } from '../../data/SequenceType';
import jsonRefData from '../../data/refData.json';
import { decodeAAMutation } from '../../helpers/aa-mutation';
import { decodeNucMutation } from '../../helpers/nuc-mutation';
import { DateRange } from '../../data/DateRange';

export type PositionProportion = {
  position: string;
  mutation: string | undefined;
  original: string | undefined;
  proportion: number;
};

export type PositionEntropy = {
  position: string;
  proportions: PositionProportion[];
  entropy: number;
};

export type GeneOption = {
  value: string;
  label: string;
  startPosition: number;
  endPosition: number;
  aaSeq: string;
  color: string;
};

type WeekEntropy = {
  week: DateRange;
  meanEntropy: number;
};

export const calculateEntropy = (
  mutations: MutationProportionEntry[] | undefined,
  sequenceType: SequenceType,
  deletions: boolean,
  excludePositionsWithZeroEntropy: boolean
): PositionEntropy[] => {
  let positionProps = initializePositionProportions(sequenceType, excludePositionsWithZeroEntropy);

  mutations?.forEach(mut => {
    if (sequenceType === 'aa') {
      let decoded = decodeAAMutation(mut.mutation);
      if (decoded.mutatedBase !== '-' || (decoded.mutatedBase === '-' && deletions)) {
        let pp: PositionProportion = {
          position: decoded.gene + ':' + decoded.originalBase + decoded.position,
          mutation: decoded.mutatedBase,
          original: decoded.originalBase,
          proportion: mut.proportion,
        };
        positionProps.push(pp);
      }
    } else {
      let decoded = decodeNucMutation(mut.mutation);
      if (decoded.mutatedBase !== '-' || (decoded.mutatedBase === '-' && deletions)) {
        let pp: PositionProportion = {
          position: decoded.position.toString(),
          mutation: decoded.mutatedBase,
          original: decoded.originalBase,
          proportion: mut.proportion,
        };
        positionProps.push(pp);
      }
    }
  });

  const positionGroups = Object.entries(
    groupBy(positionProps, positionProportion => positionProportion.position)
  ).map(([position, positionProportions]) => {
    return {
      position: position,
      original: positionProportions[0].original,
      proportions: positionProportions,
      entropy: 0,
    };
  });

  positionGroups.forEach(positionGroup => {
    const remainder = 1 - positionGroup.proportions.map(p => p.proportion).reduce((x, a) => x + a, 0);
    if (remainder !== 0) {
      positionGroup.proportions.push({
        position: positionGroup.position,
        mutation: positionGroup.original + ' (ref)',
        original: positionGroup.original,
        proportion: remainder,
      });
    }
    positionGroup.proportions = positionGroup.proportions.filter(p => p.proportion > 0);
  });

  positionGroups.forEach(positionGroup => {
    let sum = 0;
    positionGroup.proportions.forEach(
      positionProportion => (sum += positionProportion.proportion * Math.log(positionProportion.proportion))
    );
    positionGroup.entropy = -sum;
  });

  return positionGroups;
};

function initializePositionProportions(sequenceType: SequenceType, excludePositionsWithZeroEntropy: boolean) {
  if (excludePositionsWithZeroEntropy) {
    return [] as PositionProportion[];
  }

  if (sequenceType === 'nuc') {
    return Array.from({ length: 29903 }).map((_, i) => ({
      position: i.toString(),
      mutation: undefined,
      original: jsonRefData.nucSeq.substring(i, i + 1),
      proportion: 0,
    }));
  }

  return jsonRefData.genes
    .flatMap(gene =>
      gene.aaSeq.split('').map((aminoAcid, i) => ({
        position: gene.name + ':' + aminoAcid + (i + 1).toString(),
        mutation: undefined,
        original: aminoAcid,
        proportion: 0,
      }))
    )
    .flat();
}

const meanEntropy = (posEntropy: PositionEntropy[], sequenceType: SequenceType, gene: GeneOption): number => {
  const filteredPos =
    sequenceType === 'nuc'
      ? posEntropy.filter(
          g => gene.startPosition <= parseInt(g.position) && parseInt(g.position) <= gene.endPosition
        )
      : gene.value === 'All'
      ? posEntropy
      : posEntropy.filter(g => g.position.includes(gene.value));
  const sum = filteredPos.map(f => f.entropy).reduce((x, a) => x + a, 0);
  const count = sequenceType === 'nuc' ? gene.endPosition - gene.startPosition : sumOfGenesLength(gene);
  return sum / count;
};

function sumOfGenesLength(geneOption: GeneOption) {
  return (
    geneOption.value === 'All'
      ? jsonRefData.genes
      : jsonRefData.genes.filter(gene => gene.name.includes(geneOption.value))
  )
    .map(gene => gene.aaSeq.length)
    .reduce((partialSum, geneLength) => partialSum + geneLength, 0);
}

export const weeklyMeanEntropy = (
  weeks: { proportions: MutationProportionEntry[]; date: DateRange }[],
  sequenceType: SequenceType,
  selectedGene: GeneOption,
  deletions: boolean
): WeekEntropy[] => {
  return weeks.map(week => ({
    week: week.date,
    meanEntropy: meanEntropy(
      calculateEntropy(week.proportions, sequenceType, deletions, true),
      sequenceType,
      selectedGene
    ),
  }));
};

const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
