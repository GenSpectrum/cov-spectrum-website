import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { csv } from 'd3-fetch';
// import geoData from './swiss-maps1.json';
import geoData from './ch-plz.json';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';

const colorScale = scaleQuantize<string>()
  .domain([1, 10])
  .range(['#ffedea', '#ffcec5', '#ffad9f', '#ff8a75', '#ff5533', '#e2492d', '#be3d26', '#9a311f', '#782618']);

const MapChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // https://www.bls.gov/lau/
    csv('https://www.bls.gov/lau/unemployment-by-county-2017.csv').then((counties: any) => {
      setData(counties);
      console.log('counties are', counties);
    });
  }, []);

  return (
    <>
      <h1>Map</h1>
      {/* <ComposableMap projection='geoEqualEarth'> */}
      <ComposableMap
        projection='geoEqualEarth'
        projectionConfig={{ scale: 1000 }}
        width={980}
        height={551}
        style={{
          width: '100%',
          height: 'auto',
        }}
      >
        {/* <ZoomableGroup center={[0, 60]}> */}
        <ZoomableGroup center={[8, 47]} zoom={1} disablePanning>
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo: any) => {
                // const cur: any = data.find((s: any) => s.id === geo.id);
                console.log('plz', geo.id);
                // console.log('cur is ', cur);
                // return <Geography key={geo.rsmKey} geography={geo} fill={'#2ecc71'} />;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    stroke={'blue'}
                    fill={'#ffffff80'}
                    strokeWidth={1}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </>
  );
};

export default MapChart;
