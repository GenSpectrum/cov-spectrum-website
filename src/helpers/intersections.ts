import _ from 'lodash';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';

export function intersections2(...args: string[][]) {
  const numberOfArgs = args.length;

  if (numberOfArgs === 0 || numberOfArgs === 1) {
    throw new Error(`At lease two arrays should be passed as arguments.`);
  } else if (numberOfArgs === 2) {
    let variant1Mutations = args[0];
    const variant2Mutations = args[1];
    const shared = _.intersection(variant1Mutations, variant2Mutations);
    const onlyVariant1 = _.pullAll(variant1Mutations, shared);
    const onlyVariant2 = _.pullAll(variant2Mutations, shared);

    // Group by genes
    const genes = new Map<
      string,
      {
        onlyVariant1: string[];
        onlyVariant2: string[];
        shared: string[];
      }
    >();
    for (let gene of ReferenceGenomeService.genes) {
      genes.set(gene, { onlyVariant1: [], onlyVariant2: [], shared: [] });
    }

    for (let i = 0; i < shared.length; i++) {
      genes.get(shared[i].split(':')[0])!.shared.push(shared[i]);
    }
    for (let i = 0; i < onlyVariant1.length; i++) {
      genes.get(onlyVariant1[i].split(':')[0])!.onlyVariant1.push(onlyVariant1[i]);
    }
    for (let i = 0; i < onlyVariant2.length; i++) {
      genes.get(onlyVariant2[i].split(':')[0])!.onlyVariant2.push(onlyVariant2[i]);
    }
    // Count
    return [...genes.entries()].map(([gene, muts]) => ({
      gene,
      ...muts,
    }));
  }
}

export function intersections3(...args: string[][]) {
  const numberOfArgs = args.length;
  if (numberOfArgs === 0 || numberOfArgs === 1) {
    throw new Error(`At lease two arrays should be passed as arguments.`);
  } else if (numberOfArgs === 3) {
    const variant1Mutations = args[0];
    const variant2Mutations = args[1];
    const variant3Mutations = args[2];

    let i = 1;

    for (let arg of args) {
      console.log(i, arg.sort());
      i += 1;
    }

    const shared = _.intersection(variant1Mutations, variant2Mutations, variant3Mutations);

    let shared1and2 = _.intersection(variant1Mutations, variant2Mutations);
    let shared1and3 = _.intersection(variant1Mutations, variant3Mutations);
    let shared2and3 = _.intersection(variant2Mutations, variant3Mutations);

    shared1and2 = _.pullAll(shared1and2, [...new Set([shared, shared1and3, shared2and3].flat())]);
    shared1and3 = _.pullAll(shared1and3, [...new Set([shared, shared1and2, shared2and3].flat())]);
    shared2and3 = _.pullAll(shared2and3, [...new Set([shared, shared1and3, shared1and2].flat())]);

    const onlyVariant1 = _.pullAll(variant1Mutations, [
      ...new Set([shared, shared1and2, shared1and3].flat()),
    ]);
    const onlyVariant2 = _.pullAll(variant2Mutations, [
      ...new Set([shared, shared1and2, shared2and3].flat()),
    ]);
    const onlyVariant3 = _.pullAll(variant3Mutations, [
      ...new Set([shared, shared2and3, shared1and3].flat()),
    ]);

    // Group by genes
    const genes = new Map<
      string,
      {
        onlyVariant1: string[];
        onlyVariant2: string[];
        onlyVariant3: string[];
        shared: string[];
        shared1and2: string[];
        shared1and3: string[];
        shared2and3: string[];
      }
    >();
    for (let gene of ReferenceGenomeService.genes) {
      genes.set(gene, {
        onlyVariant1: [],
        onlyVariant2: [],
        onlyVariant3: [],
        shared: [],
        shared1and2: [],
        shared1and3: [],
        shared2and3: [],
      });
    }
    for (let i = 0; i < shared.length; i++) {
      genes.get(shared[i].split(':')[0])!.shared.push(shared[i]);
    }
    for (let i = 0; i < shared1and2.length; i++) {
      genes.get(shared1and2[i].split(':')[0])!.shared1and2.push(shared1and2[i]);
    }
    for (let i = 0; i < shared1and3.length; i++) {
      genes.get(shared1and3[i].split(':')[0])!.shared1and3.push(shared1and3[i]);
    }
    for (let i = 0; i < shared2and3.length; i++) {
      genes.get(shared2and3[i].split(':')[0])!.shared2and3.push(shared2and3[i]);
    }
    for (let i = 0; i < onlyVariant1.length; i++) {
      genes.get(onlyVariant1[i].split(':')[0])!.onlyVariant1.push(onlyVariant1[i]);
    }
    for (let i = 0; i < onlyVariant2.length; i++) {
      genes.get(onlyVariant2[i].split(':')[0])!.onlyVariant2.push(onlyVariant2[i]);
    }
    for (let i = 0; i < onlyVariant3.length; i++) {
      genes.get(onlyVariant3[i].split(':')[0])!.onlyVariant3.push(onlyVariant3[i]);
    }
    // Count
    return [...genes.entries()].map(([gene, muts]) => ({
      gene,
      ...muts,
    }));
  }
}

export function intersections4(...args: string[][]) {
  const numberOfArgs = args.length;

  if (numberOfArgs === 0 || numberOfArgs === 1) {
    throw new Error(`At lease two arrays should be passed as arguments.`);
  } else if (numberOfArgs === 4) {
    const variant1Mutations = args[0];
    const variant2Mutations = args[1];
    const variant3Mutations = args[2];
    const variant4Mutations = args[3];

    const shared = _.intersection(variant1Mutations, variant2Mutations, variant3Mutations, variant4Mutations);

    let shared1and2 = _.intersection(variant1Mutations, variant2Mutations); // const shared1and2 = _.pullAll(shared1and2, shared)
    let shared1and3 = _.intersection(variant1Mutations, variant3Mutations);
    let shared1and4 = _.intersection(variant1Mutations, variant4Mutations);
    let shared2and3 = _.intersection(variant2Mutations, variant3Mutations);
    let shared2and4 = _.intersection(variant2Mutations, variant4Mutations);
    let shared3and4 = _.intersection(variant3Mutations, variant4Mutations);

    let shared1and2and3 = _.intersection(variant1Mutations, variant2Mutations, variant3Mutations);

    let shared1and2and4 = _.intersection(variant1Mutations, variant2Mutations, variant4Mutations);
    let shared2and3and4 = _.intersection(variant4Mutations, variant2Mutations, variant3Mutations);
    let shared1and4and3 = _.intersection(variant4Mutations, variant1Mutations, variant3Mutations);

    shared1and2 = _.pullAll(shared1and2, [
      ...new Set(
        [
          shared,
          shared1and3,
          shared2and3,
          shared1and4,
          shared2and4,
          shared1and2and3,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);
    shared1and3 = _.pullAll(shared1and3, [
      ...new Set(
        [
          shared,
          shared1and2,
          shared2and3,
          shared1and4,
          shared3and4,
          shared1and2and3,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);

    shared1and4 = _.pullAll(shared1and4, [
      ...new Set(
        [
          shared,
          shared1and2,
          shared2and3,
          shared2and4,
          shared3and4,
          shared1and2and3,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);

    shared2and3 = _.pullAll(shared2and3, [
      ...new Set(
        [
          shared,
          shared1and3,
          shared1and2,
          shared2and4,
          shared3and4,
          shared1and2and3,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);

    shared2and4 = _.pullAll(shared2and4, [
      ...new Set(
        [
          shared,
          shared2and3,
          shared1and2,
          shared3and4,
          shared1and4,
          shared1and2and3,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);

    shared3and4 = _.pullAll(shared2and3, [
      ...new Set(
        [
          shared,
          shared1and3,
          shared1and2,
          shared2and4,
          shared2and3,
          shared1and2and3,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);

    shared1and2and3 = _.pullAll(shared1and2and3, [
      ...new Set(
        [
          shared,
          shared1and2,
          shared1and3,
          shared1and4,
          shared2and3,
          shared2and4,
          shared3and4,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);
    shared1and2and4 = _.pullAll(shared1and2and4, [
      ...new Set(
        [
          shared,
          shared1and2,
          shared1and3,
          shared1and4,
          shared2and3,
          shared2and4,
          shared3and4,
          shared1and2and3,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);
    shared2and3and4 = _.pullAll(shared2and3and4, [
      ...new Set(
        [
          shared,
          shared1and2,
          shared1and3,
          shared1and4,
          shared2and3,
          shared2and4,
          shared3and4,
          shared1and2and3,
          shared1and2and4,
          shared1and4and3,
        ].flat()
      ),
    ]);
    shared1and4and3 = _.pullAll(shared1and4and3, [
      ...new Set(
        [
          shared,
          shared1and2,
          shared1and3,
          shared1and4,
          shared2and3,
          shared2and4,
          shared3and4,
          shared1and2and3,
          shared1and2and4,
          shared2and3and4,
        ].flat()
      ),
    ]);

    const onlyVariant1 = _.pullAll(variant1Mutations, [
      ...new Set(
        [
          shared,
          shared1and2,
          shared1and3,
          shared1and4,
          shared2and3,
          shared2and4,
          shared3and4,
          shared1and2and3,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);
    const onlyVariant2 = _.pullAll(variant2Mutations, [
      ...new Set(
        [
          shared,
          shared2and3,
          shared2and4,
          shared1and2,
          shared1and3,
          shared1and4,
          shared3and4,
          shared1and2and3,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);

    const onlyVariant3 = _.pullAll(variant3Mutations, [
      ...new Set(
        [
          shared,
          shared1and3,
          shared2and3,
          shared3and4,
          shared1and4,
          shared1and2,
          shared2and4,
          shared1and2and3,
          shared2and3and4,
          shared1and4and3,
          shared1and2and4,
        ].flat()
      ),
    ]);
    const onlyVariant4 = _.pullAll(variant4Mutations, [
      ...new Set(
        [
          shared,
          shared1and4,
          shared2and4,
          shared3and4,
          shared1and2and4,
          shared2and3and4,
          shared1and4and3,
        ].flat()
      ),
    ]);

    // Group by genes
    const genes = new Map<
      string,
      {
        onlyVariant1: string[];
        onlyVariant2: string[];
        onlyVariant3: string[];
        onlyVariant4: string[];
        shared: string[];
        shared1and2: string[];
        shared1and3: string[];
        shared1and4: string[];
        shared2and3: string[];
        shared2and4: string[];
        shared3and4: string[];
        shared1and2and3: string[];
        shared1and2and4: string[];
        shared2and3and4: string[];
        shared1and4and3: string[];
      }
    >();

    for (let gene of ReferenceGenomeService.genes) {
      genes.set(gene, {
        onlyVariant1: [],
        onlyVariant2: [],
        onlyVariant3: [],
        onlyVariant4: [],
        shared: [],
        shared1and2: [],
        shared1and3: [],
        shared1and4: [],
        shared2and3: [],
        shared2and4: [],
        shared3and4: [],
        shared1and2and3: [],
        shared1and2and4: [],
        shared2and3and4: [],
        shared1and4and3: [],
      });
    }

    for (let mutation of shared) {
      genes.get(mutation.split(':')[0])!.shared.push(mutation);
    }
    for (let mutation of shared1and2) {
      genes.get(mutation.split(':')[0])!.shared1and2.push(mutation);
    }
    for (let mutation of shared1and3) {
      genes.get(mutation.split(':')[0])!.shared1and3.push(mutation);
    }

    for (let mutation of shared1and4) {
      genes.get(mutation.split(':')[0])!.shared1and4.push(mutation);
    }

    for (let mutation of shared2and3) {
      genes.get(mutation.split(':')[0])!.shared2and3.push(mutation);
    }

    for (let mutation of shared2and4) {
      genes.get(mutation.split(':')[0])!.shared2and4.push(mutation);
    }

    for (let mutation of shared3and4) {
      genes.get(mutation.split(':')[0])!.shared3and4.push(mutation);
    }

    for (let mutation of shared1and2and3) {
      genes.get(mutation.split(':')[0])!.shared1and2and3.push(mutation);
    }

    for (let mutation of shared1and2and4) {
      genes.get(mutation.split(':')[0])!.shared1and2and4.push(mutation);
    }

    for (let mutation of shared1and4and3) {
      genes.get(mutation.split(':')[0])!.shared1and4and3.push(mutation);
    }

    for (let mutation of shared2and3and4) {
      genes.get(mutation.split(':')[0])!.shared2and3and4.push(mutation);
    }

    for (let i = 0; i < onlyVariant1.length; i++) {
      genes.get(onlyVariant1[i].split(':')[0])!.onlyVariant1.push(onlyVariant1[i]);
    }

    for (let i = 0; i < onlyVariant2.length; i++) {
      genes.get(onlyVariant2[i].split(':')[0])!.onlyVariant2.push(onlyVariant2[i]);
    }

    for (let i = 0; i < onlyVariant3.length; i++) {
      genes.get(onlyVariant3[i].split(':')[0])!.onlyVariant3.push(onlyVariant3[i]);
    }

    for (let i = 0; i < onlyVariant4.length; i++) {
      genes.get(onlyVariant4[i].split(':')[0])!.onlyVariant4.push(onlyVariant4[i]);
    }

    // Count
    return [...genes.entries()].map(([gene, muts]) => ({
      gene,
      ...muts,
    }));
  }
}
