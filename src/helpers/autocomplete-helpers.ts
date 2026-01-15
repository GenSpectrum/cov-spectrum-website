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

    if (combinedCodon >= 4401) {
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
