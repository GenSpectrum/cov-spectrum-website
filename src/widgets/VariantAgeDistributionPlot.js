import React, { useEffect, useState } from "react";
import { AccountService } from "../services/AccountService";

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from "react-plotly.js/factory";
import { Utils } from "../services/Utils";

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);

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

export const VariantAgeDistributionPlot = ({ data }) => {
  const [distribution, setDistribution] = useState(null);

  useEffect(() => {
    const mutationsString = data.mutations.join(",");
    const endpoint = "/plot/variant/age-distribution";
    const requestString =
      `${endpoint}?country=${data.country}&mutations=${mutationsString}` +
      `&matchPercentage=${data.matchPercentage}`;
    let isSubscribed = true;
    //fetchdata
    const host = process.env.REACT_APP_SERVER_HOST;
    fetch(host + requestString, {
      headers: getBaseHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (isSubscribed) {
          console.log(
            "Update state for Variant Age Distribution for data",
            data
          );
          setDistribution(data);
        }
      });
    return () => {
      isSubscribed = false;
      console.log("Cleanup render for variant age distribution plot");
    };
  }, []);

  return (
    <div style={{ height: "100%" }}>
      {distribution && (
        <Plot
          style={{ width: "100%", height: "100%" }}
          data={[
            {
              type: "bar",
              x: distribution.map((d) => d.x),
              y: distribution.map((d) => d.y.count),
            },
            {
              x: distribution.map((d) => d.x),
              y: distribution.map((d) => d.y.proportion.value * 100),
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "red" },
              yaxis: "y2",
            },
          ]}
          layout={{
            title: "Age Distribution",
            yaxis: {
              title: "Number Sequences",
            },
            yaxis2: {
              title: "Estimated Percentage",
              overlaying: "y",
              side: "right",
            },
            showlegend: false,
          }}
          config={{
            displaylogo: false,
            modeBarButtons: [["zoom2d", "toImage", "resetScale2d", "pan2d"]],
            responsive: true,
          }}
        />
      )}
    </div>
  );
};
