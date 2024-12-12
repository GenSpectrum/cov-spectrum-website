import { NextcladeDatasetInfo } from '../../data/NextcladeDatasetInfo';
import { sequenceDataSource } from '../../helpers/sequence-data-source';
import { ExternalLink } from '../../components/ExternalLink';
import React from 'react';
import styled from 'styled-components';

const FooterStyle = styled.footer`
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid darkgray;
  font-size: small;
`;

export function Footer({
  nextcladeDatasetInfo,
  lapisDataVersion,
}: {
  nextcladeDatasetInfo?: NextcladeDatasetInfo;
  lapisDataVersion?: string;
}) {
  return (
    <FooterStyle className='text-center'>
      {lapisDataVersion && <div>The sequence data was updated: {lapisDataVersion}</div>}
      {nextcladeDatasetInfo?.tag && <div>Nextclade dataset version: {nextcladeDatasetInfo.tag}</div>}
      {sequenceDataSource === 'gisaid' && (
        <div>
          Data obtained from GISAID that is used in this Web Application remain subject to GISAID’s{' '}
          <ExternalLink url='http://gisaid.org/daa'>Terms and Conditions</ExternalLink>.
        </div>
      )}
      <div className='flex flex-wrap justify-center items-center gap-x-8 gap-y-4 my-4 mt-8 px-2'>
        <ExternalLink url='https://ethz.ch'>
          <img className='h-5' alt='ETH Zurich' src='/img/ethz.png' />
        </ExternalLink>
        <ExternalLink url='https://bsse.ethz.ch/cevo'>
          <img className='h-7' alt='Computational Evolution Group' src='/img/cEvo.png' />
        </ExternalLink>
        <ExternalLink url='https://www.sib.swiss/'>
          <img className='h-7' alt='SIB Swiss Institute of Bioinformatics' src='/img/sib.svg' />
        </ExternalLink>
        <ExternalLink url='https://vercel.com/?utm_source=cov-spectrum&utm_campaign=oss'>
          <img className='h-6' alt='Powered by Vercel' src='/img/powered-by-vercel.svg' />
        </ExternalLink>
      </div>
    </FooterStyle>
  );
}
