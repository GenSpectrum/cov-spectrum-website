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

export const fetchAgeDistributionData = (
  country,
  mutations,
  matchPercentage,
  signal
) => {
  const endpoint = "/plot/variant/age-distribution";
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
