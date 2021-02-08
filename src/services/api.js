import { AccountService } from '../services/AccountService';

const HOST = process.env.REACT_APP_SERVER_HOST;

const getBaseHeaders = () => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (AccountService.isLoggedIn()) {
    headers['Authorization'] = 'Bearer ' + AccountService.getJwt();
  }
  return headers;
};

const getVariantEndpoint = distributionType => {
  switch (distributionType) {
    case 'Age':
      return '/plot/variant/age-distribution';
    case 'Time':
      return '/plot/variant/time-distribution';
    case 'International':
      return '/plot/variant/international-time-distribution';
    default:
      return '/plot/variant/age-distribution';
  }
};

const getVariantRequestUrl = (distributionType, country, mutations, matchPercentage) => {
  const endpoint = getVariantEndpoint(distributionType);
  if (country !== null) {
    return `${HOST}${endpoint}?country=${country}&mutations=${mutations}&matchPercentage=${matchPercentage}`;
  } else {
    return `${HOST}${endpoint}?mutations=${mutations}&matchPercentage=${matchPercentage}`;
  }
};

export const fetchVariantDistributionData = (
  distributionType,
  country,
  mutations,
  matchPercentage,
  signal
) => {
  const url = getVariantRequestUrl(distributionType, country, mutations, matchPercentage);
  console.log('Fetching variant request', url);
  return fetch(url, {
    headers: getBaseHeaders(),
    signal,
  })
    .then(response => response.json())
    .then(ageDistributionData => {
      return ageDistributionData;
    })
    .catch(e => {
      console.log('Error fetching');
      return e;
    });
};

export const fetchTimeDistributionData = () => {};
