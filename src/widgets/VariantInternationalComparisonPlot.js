import React from "react";
import { BackendService } from "../services/BackendService";

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from 'react-plotly.js/factory';

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);


export class VariantInternationalComparisonPlot extends React.Component {

  static dataFromUrl(urlSearchParams) {
    const params = Array.from(urlSearchParams.entries());
    const data = {};
    for (let [key, value] of params) {
      switch (key) {
        case 'country':
          data['country'] = value;
          break;
        case 'matchPercentage':
          data['matchPercentage'] = parseFloat(value);
          break;
        case 'mutations':
          data['mutations'] = value.split(',');
          break;
        default:
      }
    }
    return data;
  }


  static dataToUrl(data) {
    const urlSearchParams = new URLSearchParams();
    if (data.country) {
      urlSearchParams.append('country', data.country);
    }
    urlSearchParams.append('matchPercentage', data.matchPercentage);
    urlSearchParams.append('mutations', data.mutations.join(','));
    return 'variant_international-comparison?' + urlSearchParams.toString();
  }


  constructor(props) {
    super(props);
    this.state = {
      plotData: null,
      colorMap: null
    };
  }


  componentDidMount() {
    this.updateView();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    // TODO Use a better equality check for the variant
    if (prevProps.data !== this.props.data) {
      this.updateView();
    }
  }


  async updateView() {
    this.state.distribution = null;
    const mutationsString = this.props.data.mutations.join(',');
    const endpoint = '/plot/variant/international-time-distribution';
    const distribution = await BackendService.get(`${endpoint}?mutations=${mutationsString}` +
      `&matchPercentage=${this.props.data.matchPercentage}`);

    const countriesToPlot = new Set(['United Kingdom', 'Denmark', 'Switzerland', this.props.data.country]);
    const plotData = distribution.filter(d => countriesToPlot.has(d.x.country));

    // TODO Remove hard-coding..
    const colorMap = [
      { target: 'United Kingdom', value: { marker: { color: 'black' } } },
      { target: 'Denmark', value: { marker: { color: 'green' } } },
      { target: 'Switzerland', value: { marker: { color: 'red' } } }
    ];
    if (!['United Kingdom', 'Denmark', 'Switzerland'].includes(this.props.country)) {
      colorMap.push({ target: this.props.country, value: { marker: { color: 'blue' } } });
    }

    this.setState({ plotData, colorMap })
  }


  render() {
    const { plotData, colorMap } = this.state;

    return (
      <div style={{ height: '100%' }}>
        {plotData &&
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              type: 'scatter',
              mode: 'lines+markers',
              x: plotData.map(d => d.x.week.firstDayInWeek),
              y: plotData.map(d => (d.y.proportion.value * 100).toFixed(2)),
              transforms: [{
                type: 'groupby',
                groups: plotData.map(d => d.x.country),
                styles: colorMap
              }]
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: plotData.map(d => d.x.week.firstDayInWeek),
              y: plotData.map(d => (d.y.proportion.ciLower * 100).toFixed(2)),
              line: {
                dash: 'dash',
                width: 2
              },
              transforms: [{
                type: 'groupby',
                groups: plotData.map(d => d.x.country),
                styles: colorMap
              }],
              showlegend: false
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: plotData.map(d => d.x.week.firstDayInWeek),
              y: plotData.map(d => (d.y.proportion.ciUpper * 100).toFixed(2)),
              line: {
                dash: 'dash',
                width: 2
              },
              transforms: [{
                type: 'groupby',
                groups: plotData.map(d => d.x.country),
                styles: colorMap
              }],
              showlegend: false
            }
          ]}
          layout={{
            title: '',
            yaxis: {
              title: 'Estimated Percentage'
            },
            legend: {
              x: 0,
              xanchor: 'left',
              y: 1
            }
          }}
          config={{
            displaylogo: false,
            modeBarButtons: [["zoom2d", "toImage", "resetScale2d", "pan2d"]],
            responsive: true
          }}
        />}
      </div>
    );
  }

}
