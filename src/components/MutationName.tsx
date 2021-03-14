import React from 'react';
import styled from 'styled-components';
import { OverlayTrigger, Popover } from 'react-bootstrap';

interface Props {
  mutation: string;
}

const headerMap: { [index: string]: string | undefined } = {
  ORF1a: 'ORF1ab polyprotein',
  ORF1b: 'ORF1ab polyprotein',
  S: 'Spike glycoprotein',
  E: 'Envelope protein',
  M: 'Membrane glycoprotein',
  N: 'Nucleocapsid phosphoprotein',
};

const textMap: { [index: string]: string | undefined } = {
  S:
    'important for binding to host cell, trimeric, can be cleaved into S1 part (containing RBD) and S2 part; ' +
    'S1 = involved in attachment of virions by interaction with human ACE2; S2: fusion protein; immunogenic',
  E:
    'relevant for assembly and release of virions, 75 aa, can assemble into host membrane to form ' +
    'protein-lipid pores (viroporin)',
  M: '222 aa, relevant for RNA packaging, most abundant viral protein, contains transmembrane domains',
  N: 'relevant for packing of RNA into ribonucleocapsid, known to be immunogenic',
};

const ORF1abProteins = [
  {
    range: [1, 180],
    text:
      "N-terminal product of viral replicase, mediates RNA replication and processing, suppresses hosts' immune functions",
    name: 'Nsp1',
  },
  {
    range: [181, 818],
    text: 'replicase product essential for proofreading, modulation of host cell signalling pathways',
    name: 'Nsp2',
  },
  {
    range: [819, 2763],
    text: 'papain-like protease, separates polyprotein into distinct proteins',
    name: 'Nsp3',
  },
  {
    range: [2764, 3263],
    text: 'anchors viral replication-transcription complex to ER membranes',
    name: 'Nsp4',
  },
  {
    range: [3264, 3569],
    text: '3C-like protease, involved in viral polyprotein processing',
    name: 'Nsp5',
  },
  {
    range: [3570, 3859],
    text:
      'transmembrane domain, relevant for initial induction of autophagosomes from host ER, suppresses IFN-I signalling',
    name: 'Nsp6',
  },
  {
    range: [3860, 3942],
    text: 'RNA-dependent RNA polymerase, forms complex with Nsp8 (primase)',
    name: 'Nsp7',
  },
  {
    range: [3943, 4140],
    text: 'RNA polymerase, replicase, primase',
    name: 'Nsp8',
  },
  {
    range: [4141, 4253],
    text: 'single-stranded RNA-binding protein',
    name: 'Nsp9',
  },
  {
    range: [4254, 4392],
    text: 'growth-factor-like protein containing Zinc-binding motifs, important for mRNAs cap methylation',
    name: 'Nsp10',
  },
  {
    range: [4393, 5324],
    text:
      'RNA dependent RNA polymerase (catalytic subunit), responsible for replication and transcription of viral RNA',
    name: 'Nsp12',
  },
  {
    range: [5325, 5925],
    text: 'Zinc-binding domain, NTPase/helicase',
    name: 'Nsp13',
  },
  {
    range: [5926, 6452],
    text: "Proofreading exoribonuclease domain (3' to 5' direction)",
    name: 'Nsp14',
  },
  {
    range: [6453, 6798],
    text: 'EndoRNAse, Mn(2+) dependent endoribonuclease',
    name: 'Nsp15',
  },
  {
    range: [6799, 7096],
    text: "2'-O-ribose methyltransferase",
    name: 'Nsp16',
  },
];

const Mut = styled.span`
  border-radius: 5px;
  padding: 3px 5px;
  margin-right: -5px;
  cursor: pointer;

  &:hover {
    background: #eaeaea;
  }
`;

const getInformation = (gene: string, position: number): { header: string; text?: string } => {
  let header = headerMap[gene];
  if (!header) {
    return {
      header: gene + ' protein',
    };
  }

  let text: string | undefined;
  if (gene === 'ORF1a' || gene === 'ORF1b') {
    if (gene === 'ORF1b') {
      position += 4401;
    }
    for (let nsp of ORF1abProteins) {
      if (position >= nsp.range[0] && position <= nsp.range[1]) {
        header += ': ' + nsp.name;
        text = nsp.text;
      }
    }
  } else {
    text = textMap[gene];
  }

  return { header, text };
};

export const MutationName = ({ mutation }: Props) => {
  const [gene, mut] = mutation.split(':');
  const position = mut.substring(1, mut.length - 1);

  const information = getInformation(gene, parseInt(position));
  const popover = (
    <Popover id='popover-basic' style={{ maxWidth: '600px' }}>
      <Popover.Title as='h3'>{information.header}</Popover.Title>
      <Popover.Content>
        {information.text || <i className='text-muted'>No description available</i>}
      </Popover.Content>
    </Popover>
  );

  return (
    <>
      <OverlayTrigger
        trigger='click'
        overlay={popover}
        rootClose={true}
        transition={false}
        placement='bottom'
      >
        <Mut>{mutation}</Mut>
      </OverlayTrigger>
    </>
  );
};
