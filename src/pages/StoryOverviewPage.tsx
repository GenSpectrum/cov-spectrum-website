import React from 'react';
import { ExternalLink } from '../components/ExternalLink';

const Story = ({ title, id, children }: { title: string; id: string; children: React.ReactNode }) => {
  return (
    <div className='w-full bg-blue-50 shadow-lg mb-6 mt-4 rounded-xl p-4 dark:bg-gray-800'>
      <a href={`/story/${id}`}>
        <h2 className='font-bold mb-2 mt-0'>{title}</h2>
      </a>
      <p>{children}</p>
    </div>
  );
};

export const StoryOverviewPage = () => {
  return (
    <div className='max-w-4xl mx-auto px-4 md:px-8'>
      <Story title='Wastewater in Switzerland' id='wastewater-in-switzerland'>
        <div className='italic'>
          by{' '}
          <ExternalLink url='https://bsse.ethz.ch/cbg/'>Computational Biology Group, ETH Zurich</ExternalLink>
        </div>
        <p>
          We report estimates of the prevalence of different genomic variants of SARS-CoV-2 obtained from
          wastewater samples. Samples are collected daily at six Swiss wastewater treatment plants (by{' '}
          <ExternalLink url='https://www.eawag.ch/en/department/sww/projects/sars-cov2-in-wastewater/'>
            Eawag
          </ExternalLink>
          ).
        </p>
      </Story>
    </div>
  );
};
