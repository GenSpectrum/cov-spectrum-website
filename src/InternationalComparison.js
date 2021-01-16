import React from "react";
import { BackendService } from "./BackendService";

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from 'react-plotly.js/factory';

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);


export class InternationalComparison extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      distribution: null
    };
  }


  componentDidMount() {
    this.updateView();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    // TODO Use a better equality check for the variant
    if (prevProps.variant !== this.props.variant) {
      this.updateView();
    }
  }


  async updateView() {
    this.loadInternationalTimeDistribution();
  }


  async loadInternationalTimeDistribution() {
    this.state.distribution = null;
    const mutationsString = this.props.variant.mutations.join(',');
    const endpoint = '/variant/international-time-distribution';
    const distribution
      = await BackendService.get(`${endpoint}?country=${this.props.country}&mutations=${mutationsString}` +
      `&matchPercentage=${this.props.matchPercentage}`);
    this.setState({ distribution })
  }


  render() {
    // TODO Remove hard-coding..
    const colorMap = [
      {target: 'United Kingdom', value: {marker: {color: 'black'}}},
      {target: 'Denmark', value: {marker: {color: 'green'}}},
      {target: 'Switzerland', value: {marker: {color: 'red'}}}
    ];
    if (!['United Kingdom', 'Denmark', 'Switzerland'].includes(this.props.country)) {
      colorMap.push({target: this.props.country, value: {marker: {color: 'blue'}}});
    }

    return (<>
      <h3>
        {this.props.variant.name ?? 'Unnamed Variant'} - International Comparison
      </h3>
      {
        this.state.distribution ? (
            <Plot
              style={{ width: '100%' }}
              data={[
                {
                  type: 'scatter',
                  mode: 'lines+markers',
                  x: this.state.distribution.map(d => d.week.firstDayInWeek),
                  y: this.state.distribution.map(d => (d.p * 100).toFixed(2)),
                  transforms: [{
                    type: 'groupby',
                    groups: this.state.distribution.map(d => d.country),
                    styles: colorMap
                  }]
                },
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: this.state.distribution.map(d => d.week.firstDayInWeek),
                  y: this.state.distribution.map(d => (d.pLower * 100).toFixed(2)),
                  line: {
                    dash: 'dash',
                    width: 2
                  },
                  transforms: [{
                    type: 'groupby',
                    groups: this.state.distribution.map(d => d.country),
                    styles: colorMap
                  }],
                  showlegend: false
                },
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: this.state.distribution.map(d => d.week.firstDayInWeek),
                  y: this.state.distribution.map(d => (d.pUpper * 100).toFixed(2)),
                  line: {
                    dash: 'dash',
                    width: 2
                  },
                  transforms: [{
                    type: 'groupby',
                    groups: this.state.distribution.map(d => d.country),
                    styles: colorMap
                  }],
                  showlegend: false
                }
              ]}
              layout={{
                height: 500,
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
                modeBarButtons: [["zoom2d", "toImage", "resetScale2d", "pan2d"]]
              }}
            />
          ) :
          null
      }
    </>);
  }


}
