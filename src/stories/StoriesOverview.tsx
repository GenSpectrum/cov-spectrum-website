import React, { useEffect } from 'react';
import { ExternalLink } from '../components/ExternalLink';

const StoryPreviewWrapper = ({
  title,
  id,
  children,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    document.title = `Stories - covSPECTRUM`;
  });

  return (
    <div className='w-full bg-blue-50 shadow-lg mb-6 mt-4 rounded-xl p-4 dark:bg-gray-800'>
      <a href={`/stories/${id}`}>
        <h2 className='font-bold mb-2 mt-0'>{title}</h2>
      </a>
      <p>{children}</p>
    </div>
  );
};

const StoriesOverview = () => (
  <div className='max-w-4xl mx-auto px-4 md:px-8'>
    <StoryPreviewWrapper title='Wastewater in Switzerland' id='wastewater-in-switzerland'>
      <div className='italic'>
        by{' '}
        <ExternalLink url='https://bsse.ethz.ch/cbg/'>Computational Biology Group, ETH Zurich</ExternalLink>
      </div>
      <p>
        We report estimates of the prevalence of different genomic variants of SARS-CoV-2 obtained from
        samples collected at different Swiss wastewater treatment plants (
        <ExternalLink url='https://bsse.ethz.ch/cbg/research/computational-virology/sarscov2-variants-wastewater-surveillance.html#data-sources'>
          see our website for the sources
        </ExternalLink>
        ).
      </p>
    </StoryPreviewWrapper>
  </div>
);

export default StoriesOverview;
