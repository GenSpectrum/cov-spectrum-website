import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { VariantTimeDistributionPlot } from "../widgets/VariantTimeDistributionPlot";
import { VariantAgeDistributionPlot } from "../widgets/VariantAgeDistributionPlot";
import { VariantInternationalComparisonPlot } from "../widgets/VariantInternationalComparisonPlot";
import { dataFromUrl } from "../helpers/urlConversion";

const host = process.env.REACT_APP_WEBSITE_HOST;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function EmbedPage() {
  const widget = useParams().widget;
  const query = useQuery();

  if (!widget) {
    throw new Error("Widget is unspecified."); // TODO Redirect to a 404 page
  }

  let widgetEl;
  let data;

  switch (widget) {
    case "variant_age-distribution":
      data = dataFromUrl(query, "VariantAgeDistribution");
      widgetEl = <VariantAgeDistributionPlot data={data} />;
      break;
    case "variant_international-comparison":
      data = dataFromUrl(query, "VariantInternationalComparison");
      widgetEl = <VariantInternationalComparisonPlot data={data} />;
      break;
    case "variant_time-distribution":
      data = dataFromUrl(query, "VariantTimeDistribution");
      widgetEl = <VariantTimeDistributionPlot data={data} />;
      break;
    default:
      throw new Error("Unknown widget."); // TODO Redirect to a 404 page
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div>
        This widget is provided by the{" "}
        <a rel="noreferrer" target="_blank" href={host}>
          <span style={{ color: "orange", fontWeight: "bold" }}>
            CoV-Spectrum
          </span>
        </a>
        .
      </div>
      <div style={{ flexGrow: 1 }}>{widgetEl}</div>
    </div>
  );
}
