import {
  WasteWaterDataset,
  WasteWaterMutationOccurrencesDataset,
  WasteWaterRequest,
  WasteWaterTimeseriesSummaryDataset,
} from './types';
import dayjs from 'dayjs';

function generateHeatMapData(
  numberRows: number,
  numberColumns: number
): WasteWaterMutationOccurrencesDataset {
  const START_DATE = new Date('2021-01-12');
  function drawTwoBases() {
    const BASES = ['A', 'T', 'C', 'G'];
    const base1 = BASES[Math.floor(Math.random() * 4)];
    while (true) {
      const base2 = BASES[Math.floor(Math.random() * 4)];
      if (base2 !== base1) {
        return [base1, base2];
      }
    }
  }
  function drawPosition() {
    return Math.floor(Math.random() * 29003) + 1;
  }
  const nucMutations: string[] = [];
  const dates: Date[] = [];
  for (let i = 0; i < numberRows; i++) {
    const [base1, base2] = drawTwoBases();
    nucMutations.push(base1 + drawPosition() + base2);
  }
  for (let i = 0; i < numberColumns; i++) {
    dates.push(
      dayjs(START_DATE)
        .add(3 * i, 'days')
        .toDate()
    );
  }
  const data: WasteWaterMutationOccurrencesDataset = [];
  for (let nucMutation of nucMutations) {
    for (let date of dates) {
      // Data might be missing...
      if (Math.random() < 0.1) {
        continue;
      }
      data.push({
        date,
        nucMutation,
        proportion: Math.random() < 0.1 ? undefined : Math.random(), // ...or undefined
      });
    }
  }
  return data;
}

export async function getData({ country, variantName }: WasteWaterRequest): Promise<WasteWaterDataset> {
  const data: Array<{
    location: string;
    timeseriesSummary: WasteWaterTimeseriesSummaryDataset;
    mutationOccurrences: WasteWaterMutationOccurrencesDataset;
  }> = [];
  const locations = ['Zurich', 'Lausanne', 'Geneva'];
  for (let location of locations) {
    data.push({
      location: location,
      timeseriesSummary: [
        {
          date: new Date('2021-01-01'),
          proportion: 0.15,
          proportionCI: [0.03, 0.19],
        },
        {
          date: new Date('2021-01-07'),
          proportion: 0.32,
          proportionCI: [0.25, 0.37],
        },
        {
          date: new Date('2021-01-15'),
          proportion: 0.41,
          proportionCI: [0.25, 0.49],
        },
        {
          date: new Date('2021-01-19'),
          proportion: 0.43,
          proportionCI: [0.3, 0.51],
        },
        {
          date: new Date('2021-01-23'),
          proportion: 0.52,
          proportionCI: [0.45, 0.59],
        },
        {
          date: new Date('2021-01-31'),
          proportion: 0.62,
          proportionCI: [0.58, 0.66],
        },
        {
          date: new Date('2021-02-30'),
          proportion: 0.54,
          proportionCI: [0.41, 0.67],
        },
      ],
      mutationOccurrences: generateHeatMapData(11, 15),
    });
  }
  return {
    updateDate: new Date('2021-04-16'),
    data,
  };
}
