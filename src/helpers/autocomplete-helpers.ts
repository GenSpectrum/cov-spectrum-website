function is_numeric(str: string) {
  return /^\d+$/.test(str);
}

function getLetter(value: string, position: 'before' | 'after') {
  if (position === 'before') {
    return !is_numeric(value.charAt(0)) ? value.charAt(0) : '';
  } else {
    return !is_numeric(value.charAt(value.length - 1)) ? value.charAt(value.length - 1) : '';
  }
}

function getCodon(value: string) {
  return parseInt(value.replace(/\D/g, ''));
}

interface NspMap {
  [name: string]: number;
}
const nsps: NspMap = {
  nsp1: 1,
  nsp2: 181,
  nsp3: 819,
  nsp4: 2764,
  nsp5: 3264,
  nsp6: 3570,
  nsp7: 3860,
  nsp8: 3943,
  nsp9: 4141,
  nsp10: 4254,
  nsp12: 4393,
  nsp13: 5325,
  nsp14: 5926,
  nsp15: 6453,
  nsp16: 6799,
};

//  gets the equivalents of the orf1a/b notation for the autocomplete options
export function getEquivalent(value: string, notation: 'nsp' | 'orf1ab') {
  let mutationArray = value.split(':');
  if (mutationArray[0] === 'ORF1b' || mutationArray[0] === 'ORF1a') {
    // get the letters
    let letterBefore = mutationArray[1].charAt(0);
    let letterAfter = mutationArray[1].charAt(mutationArray[1].length - 1);
    // calculate combined codon and nsp codeone: https://github.com/theosanderson/Codon2Nucleotide/blob/main/src/App.js
    let orf1aorbcodon: number = parseInt(mutationArray[1].slice(1, -1));
    let combinedCodon: number = orf1aorbcodon + (mutationArray[0] === 'ORF1b' ? 4401 : 0);
    let nsp: string = 'nsp1';
    let nspCodon: number = combinedCodon - nsps[nsp] + 1;
    for (const [key, value] of Object.entries(nsps)) {
      if (combinedCodon > value && combinedCodon - value < combinedCodon - nsps[nsp]) {
        nsp = key;
        nspCodon = combinedCodon - value + 1;
      }
    }
    if (notation === 'nsp') {
      return `${nsp}:${letterBefore}${nspCodon}${letterAfter}`;
    } else if (notation === 'orf1ab') {
      return `ORF1ab:${letterBefore}:${combinedCodon}${letterAfter}`;
    } else {
      return value;
    }
  }
}

// gets the translation of the entered nsp or orf1ab value
export const translateMutation = (oldValue: string) => {
  let mutationArray = oldValue.split(':');
  let letterAfter = getLetter(mutationArray[1], 'after');
  let letterBefore = getLetter(mutationArray[1], 'before');
  let orf1aorb: string = 'ORF1a';
  let orf1aorbcodon: number;

  if (mutationArray[0].toLowerCase().startsWith('nsp')) {
    if (!Object.keys(nsps).some(key => key === mutationArray[0])) {
      return '';
    }
    let nsp: string = mutationArray[0];
    let nspCodon = getCodon(mutationArray[1]);
    let combinedCodon = nsps[nsp] + nspCodon - 1;

    if (combinedCodon >= nsps['nsp13']) {
      orf1aorbcodon = nsps[nsp] + nspCodon - 1 - 4401;
      orf1aorb = 'ORF1b';
    } else {
      orf1aorbcodon = nsps[nsp] + nspCodon - 1;
    }
    return orf1aorb + ':' + letterBefore.toUpperCase() + orf1aorbcodon + letterAfter.toUpperCase();
  } else if (mutationArray[0].toLowerCase() === 'orf1ab') {
    let combinedCodon = getCodon(mutationArray[1]);
    if (combinedCodon > 4401) {
      orf1aorbcodon = combinedCodon - 4401;
      orf1aorb = 'ORF1b';
    } else {
      orf1aorbcodon = combinedCodon;
    }
    return orf1aorb + ':' + letterBefore.toUpperCase() + orf1aorbcodon + letterAfter.toUpperCase();
  }
  return oldValue;
};
