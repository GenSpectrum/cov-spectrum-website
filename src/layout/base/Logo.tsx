import { Link, useLocation } from 'react-router-dom';
import { useExploreUrl } from '../../helpers/explore-url';
import { encodeLocationSelectorToSingleString } from '../../data/LocationSelector';
import { defaultDateRange, defaultSamplingStrategy } from '../../data/default-selectors';
import React from 'react';

const letters = [
  { color: 'darkgray', text: 'cov' },
  { color: '#0D4A70', text: 'S' },
  { color: '#245C70', text: 'P' },
  { color: '#3A6E6F', text: 'E' },
  { color: '#67916E', text: 'C' },
  { color: '#AC8D3A', text: 'T' },
  { color: '#CF8B20', text: 'R' },
  { color: '#E08A13', text: 'U' },
  { color: '#F18805', text: 'M' },
];
export const Logo = () => {
  const locationState = useLocation();
  const exploreUrl = useExploreUrl();
  let redirectLink = '/';
  if (locationState.pathname.startsWith('/explore/') && exploreUrl?.location) {
    redirectLink = `/explore/${encodeLocationSelectorToSingleString(
      exploreUrl?.location
    )}/${defaultSamplingStrategy}/${defaultDateRange}`;
  }

  return (
    <Link to={redirectLink} className='flex flex-row items-center hover:no-underline md:mb-0.5'>
      <div>
        {letters.map((l: { color: string; text: string }, i) => (
          <span key={i} style={{ color: l.color, fontWeight: 'bold', fontSize: '1.75rem' }}>
            {l.text}
          </span>
        ))}
      </div>
    </Link>
  );
};
