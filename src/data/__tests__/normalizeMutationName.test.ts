import { normalizeMutationName } from '../VariantSelector';

describe('Testing normalizeMutationName() function', () => {
  test('Testing if the mutation names are normalized correctly', async () => {
    const example1 = await normalizeMutationName('c21t'); //nuc mutation
    expect(example1).toBe('C21T');

    const example1b = await normalizeMutationName('21t'); //nuc mutation
    expect(example1b).toBe('C21T');

    const example1c = await normalizeMutationName('21'); //nuc mutation
    expect(example1c).toBe('C21');

    const example2 = await normalizeMutationName('ins_22204:?gag?gaa'); // nuc insertion
    expect(example2).toBe('ins_22204:?GAG?GAA');

    const example3 = await normalizeMutationName('ins_s:214:epE'); // aa insertion
    expect(example3).toBe('ins_S:214:EPE');

    const example3b = await normalizeMutationName('InS_s:214:epE'); // aa insertion
    expect(example3b).toBe('ins_S:214:EPE');

    const example4 = await normalizeMutationName('orf1b:1050n'); // aa mutation
    expect(example4).toBe('ORF1b:T1050N');

    const example4b = await normalizeMutationName('orf1b:t1050n'); // aa mutation
    expect(example4b).toBe('ORF1b:T1050N');

    const example4c = await normalizeMutationName('orf1b:t1050'); // aa mutation
    expect(example4c).toBe('ORF1b:T1050');
  });
});
