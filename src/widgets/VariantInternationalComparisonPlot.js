import React, { useState, useEffect } from "react";
import { fetchVariantDistributionData } from "../services/api";

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from "react-plotly.js/factory";

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);

export const VariantInternationalComparisonPlot = ({ data }) => {
  const [plotData, setPlotData] = useState(null);
  const [colorMap, setColorMap] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    fetchVariantDistributionData(
      "International",
      data.country,
      data.mutations,
      data.matchPercentage,
      signal
    ).then((newDistributionData) => {
      if (isSubscribed) {
        const countriesToPlot = new Set([
          "United Kingdom",
          "Denmark",
          "Switzerland",
          data.country,
        ]);
        const newPlotData = newDistributionData.filter((d) =>
          countriesToPlot.has(d.x.country)
        );
        // TODO Remove hard-coding..
        const newColorMap = [
          { target: "United Kingdom", value: { marker: { color: "black" } } },
          { target: "Denmark", value: { marker: { color: "green" } } },
          { target: "Switzerland", value: { marker: { color: "red" } } },
        ];
        if (
          !["United Kingdom", "Denmark", "Switzerland"].includes(data.country)
        ) {
          newColorMap.push({
            target: data.country,
            value: { marker: { color: "blue" } },
          });
        }
        setColorMap(newColorMap);
        setPlotData(newPlotData);
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
      console.log("Cleanup render for variant age distribution plot");
    };
  }, [data]);

  return (
    <div style={{ height: "100%" }}>
      {!plotData && <p>Loading...</p>}
      {plotData && (
        <Plot
          style={{ width: "100%", height: "100%" }}
          data={[
            {
              type: "scatter",
              mode: "lines+markers",
              x: plotData.map((d) => d.x.week.firstDayInWeek),
              y: plotData.map((d) => (d.y.proportion.value * 100).toFixed(2)),
              transforms: [
                {
                  type: "groupby",
                  groups: plotData.map((d) => d.x.country),
                  styles: colorMap,
                },
              ],
            },
            {
              type: "scatter",
              mode: "lines",
              x: plotData.map((d) => d.x.week.firstDayInWeek),
              y: plotData.map((d) => (d.y.proportion.ciLower * 100).toFixed(2)),
              line: {
                dash: "dash",
                width: 2,
              },
              transforms: [
                {
                  type: "groupby",
                  groups: plotData.map((d) => d.x.country),
                  styles: colorMap,
                },
              ],
              showlegend: false,
            },
            {
              type: "scatter",
              mode: "lines",
              x: plotData.map((d) => d.x.week.firstDayInWeek),
              y: plotData.map((d) => (d.y.proportion.ciUpper * 100).toFixed(2)),
              line: {
                dash: "dash",
                width: 2,
              },
              transforms: [
                {
                  type: "groupby",
                  groups: plotData.map((d) => d.x.country),
                  styles: colorMap,
                },
              ],
              showlegend: false,
            },
          ]}
          layout={{
            title: "",
            yaxis: {
              title: "Estimated Percentage",
            },
            legend: {
              x: 0,
              xanchor: "left",
              y: 1,
            },
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
