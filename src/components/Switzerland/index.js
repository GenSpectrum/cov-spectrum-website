import React, { Fragment, useEffect } from "react";
import { geoPath, geoTransform } from "d3-geo";
import { scaleLinear, scaleThreshold, scaleOrdinal } from "d3-scale";
import ReactTooltip from "react-tooltip"

import bbox from "@turf/bbox";
import relief from "./relief.jpg";
import geoJson from "./PLZ10.json";

const SwissMap = ({ data = [], width = 1000 }) => {
  const [minX, minY, maxX, maxY] = bbox(geoJson);

  useEffect(() => {
    console.log("started...");
  }, []);
  
  const height = ((maxY - minY) / (maxX - minX)) * width;
  
  // create plain old linear x and y scales
  // this is possible as the swiss coordinate system
  // is linear and 1 x/y unit equals 1 meter
  const x = scaleLinear().range([0, width]).domain([minX, maxX]);
  const y = scaleLinear().range([0, height]).domain([maxY, minY]);

  // Custom cartesisian projection
  // https://bl.ocks.org/mbostock/6216797
  const projection = geoTransform({
    point: function (px, py) {
      this.stream.point(x(px), y(py));
    },
  });

  // svg paths from geoJson feature
  const path = geoPath().projection(projection);

  useEffect(() => {
    console.log("Rebuilding tooltip...")
    ReactTooltip.rebuild();
  }, []);

  return (
    <div>
      <h1>Number of cases by postal code</h1>
      <div style={{ position: "relative", width, height }}>
        <img
          src={relief}
          style={{ opacity: 0.4, width: "100%", height: "auto" }}
          alt=""
        />
        <svg
          // data-tip="hello world"
          width={width}
          height={height}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {geoJson.features.map((feature) => {
            console.log("PLZ...");
            console.log("PLZ is ", feature.properties.PLZ);
            return (
              <path
                data-tip={`${feature.properties.PLZ} - X`}
                key={`path-${feature.properties.bfsId}`}
                stroke="white"
                strokeWidth={0.25}
                d={path(feature)}
                fill={feature.properties.PLZ < 5000 ? "red" : "blue"}
                />
            );
          })}
        </svg>
      </div>
      <ReactTooltip/>
    </div>
  );
};

export const widthEqual = (prevProps, nextProps) =>
  prevProps.width === nextProps.width;

export default React.memo(SwissMap, widthEqual);
