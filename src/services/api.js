import { AccountService } from "../services/AccountService";

const HOST = process.env.REACT_APP_SERVER_HOST;

const getBaseHeaders = () => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (AccountService.isLoggedIn()) {
    headers["Authorization"] = "Bearer " + AccountService.getJwt();
  }
  return headers;
};

const getEndpoint = (distributionType) => {
  switch (distributionType) {
    case "Age":
      return "/plot/variant/age-distribution";
    case "Time":
      return "/plot/variant/time-distribution";
    case "International":
      return "/plot/variant/international-time-distribution";
    default:
      return "/plot/variant/age-distribution";
  }
};

export const fetchVariantDistributionData = (
  distributionType,
  country,
  mutations,
  matchPercentage,
  signal
) => {
  const endpoint = getEndpoint(distributionType);
  const request =
    `${endpoint}?country=${country}&mutations=${mutations}` +
    `&matchPercentage=${matchPercentage}`;
  console.log("request is", request);
  return fetch(HOST + request, {
    headers: getBaseHeaders(),
    signal,
  })
    .then((response) => response.json())
    .then((ageDistributionData) => {
      return ageDistributionData;
    })
    .catch((e) => {
      console.log("Error fetching");
      return e;
    });
};

export const fetchTimeDistributionData = () => {};
