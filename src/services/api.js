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

export const post = (endpoint, body) => {
  const url = HOST + endpoint;
  return fetch(url, {
    method: 'POST',
    headers: getBaseHeaders(),
    body: JSON.stringify(body),
  });
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

export const getVariantDistributionData = (distributionType, country, mutations, matchPercentage, signal) => {
  const url = getVariantRequestUrl(distributionType, country, mutations, matchPercentage);
  // console.log('Fetching variant request', url);
  return fetch(url, {
    headers: getBaseHeaders(),
    signal,
  })
    .then(response => {
      // console.log('Response is', response);
      return response.json();
    })
    .then(distributionData => {
      // console.log('Data for ', distributionType, distributionData);
      return distributionData;
    })
    .catch(e => {
      console.log('Error fetching', e);
      return e;
    });
};

export const getGrowingVariants = (year, week, country, signal) => {
  const endpoint = `/computed/find-growing-variants?year=${year}&week=${week}&country=${country}`;
  const url = HOST + endpoint;
  return fetch(url, { headers: getBaseHeaders(), signal }).then(response => response.json());
};

export const getVariants = () => {
  const url = HOST + '/resource/variant';
  return fetch(url, { headers: getBaseHeaders() }).then(response => response.json());
};

export const getCurrentWeek = () => {
  const url = HOST + '/utils/current-week';
  return fetch(url, { headers: getBaseHeaders() }).then(response => response.json());
};

export const getCountries = () => {
  const url = HOST + '/resource/country';
  return fetch(url, { headers: getBaseHeaders() }).then(response => response.json());
};
export const fetchTimeDistributionData = () => {};
