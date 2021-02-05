export const dataFromUrl = (urlSearchParams, type) => {
  if (type === "variantAgeDistribution") {
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
  }
};
export const dataToUrl = (data, type) => {
  if (type === "VariantAgeDistribution") {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("country", data.country);
    urlSearchParams.append("matchPercentage", data.matchPercentage);
    urlSearchParams.append("mutations", data.mutations.join(","));
    return "variant_age-distribution?" + urlSearchParams.toString();
  } else {
    return "No url";
  }
};
