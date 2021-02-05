export const dataFromUrl = (urlSearchParams, type) => {
  if (
    type === "VariantAgeDistribution" ||
    type === "VariantTimeDistribution" ||
    type === "VariantInternationalComparison"
  ) {
    const params = Array.from(urlSearchParams.entries());
    const data = {};
    for (let [key, value] of params) {
      switch (key) {
        case "country":
          data["country"] = value;
          break;
        case "matchPercentage":
          data["matchPercentage"] = parseFloat(value);
          break;
        case "mutations":
          data["mutations"] = value.split(",");
          break;
        default:
      }
    }
    return data;
  } else {
    console.log("Error getting data from URL");
  }
};

export const dataToUrl = (data, type) => {
  const urlSearchParams = new URLSearchParams();
  if (data.country) {
    urlSearchParams.append("country", data.country);
  }
  urlSearchParams.append("matchPercentage", data.matchPercentage);
  urlSearchParams.append("mutations", data.mutations.join(","));
  switch (type) {
    case "VariantAgeDistribution":
      return "variant_age-distribution?" + urlSearchParams.toString();
    case "VariantTimeDistribution":
      return "variant_time-distribution?" + urlSearchParams.toString();
    case "VariantInternationalComparison":
      return "variant_international-comparison?" + urlSearchParams.toString();
    default:
      console.log("URL_TYPE_CONVERSION_ERROR");
  }
};
