import React from "react";
import { BackendService } from "./BackendService";

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from 'react-plotly.js/factory';
import Table from "react-bootstrap/Table";
import { Utils } from "./Utils";

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
    if (prevProps.variant !== this.props.variant || prevProps.country !== this.props.country) {
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
      = await BackendService.get(`${endpoint}?mutations=${mutationsString}` +
      `&matchPercentage=${this.props.matchPercentage}`);
    this.setState({ distribution });
  }


  render() {
    const countriesToPlot = new Set(['United Kingdom', 'Denmark', 'Switzerland', this.props.country]);

    const plotData = this.state.distribution?.filter(d => countriesToPlot.has(d.country));

    // TODO Remove hard-coding..
    const colorMap = [
      { target: 'United Kingdom', value: { marker: { color: 'black' } } },
      { target: 'Denmark', value: { marker: { color: 'green' } } },
      { target: 'Switzerland', value: { marker: { color: 'red' } } }
    ];
    if (!['United Kingdom', 'Denmark', 'Switzerland'].includes(this.props.country)) {
      colorMap.push({ target: this.props.country, value: { marker: { color: 'blue' } } });
    }

    const aggregated = Utils.groupBy(this.state.distribution, d => d.country);
    const countryData = [];
    aggregated?.forEach((value, name) => {
      countryData.push(value.reduce((aggregated, entry) => ({
        country: aggregated.country,
        count: aggregated.count + entry.count,
        first: Utils.minBy(aggregated.first, entry.week, w => w.firstDayInWeek),
        last: Utils.maxBy(aggregated.last, entry.week, w => w.firstDayInWeek),
      }), {
        country: name,
        count: 0,
        first: {
          firstDayInWeek: Infinity,
          yearWeek: 'XXXX-XX'
        },
        last: {
          firstDayInWeek: -Infinity,
          yearWeek: 'XXXX-XX'
        }
      }));
    });


    console.log(aggregated, countryData);

    return (<>
      <h3>
        {this.props.variant.name ?? 'Unnamed Variant'} - International Comparison
      </h3>
      {
        plotData ? (<>
            <Plot
              style={{ width: '100%' }}
              data={[
                {
                  type: 'scatter',
                  mode: 'lines+markers',
                  x: plotData.map(d => d.week.firstDayInWeek),
                  y: plotData.map(d => (d.p * 100).toFixed(2)),
                  transforms: [{
                    type: 'groupby',
                    groups: plotData.map(d => d.country),
                    styles: colorMap
                  }]
                },
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: plotData.map(d => d.week.firstDayInWeek),
                  y: plotData.map(d => (d.pLower * 100).toFixed(2)),
                  line: {
                    dash: 'dash',
                    width: 2
                  },
                  transforms: [{
                    type: 'groupby',
                    groups: plotData.map(d => d.country),
                    styles: colorMap
                  }],
                  showlegend: false
                },
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: plotData.map(d => d.week.firstDayInWeek),
                  y: plotData.map(d => (d.pUpper * 100).toFixed(2)),
                  line: {
                    dash: 'dash',
                    width: 2
                  },
                  transforms: [{
                    type: 'groupby',
                    groups: plotData.map(d => d.country),
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

            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <Table striped bordered hover>
                <thead>
                <tr>
                  <th>Country</th>
                  <th>Total Variant Sequences</th>
                  <th>First seq. found at</th>
                  <th>Last seq. found at</th>
                </tr>
                </thead>
                <tbody>
                {
                  countryData.map(c => (
                    <tr>
                      <td>{c.country}</td>
                      <td>{c.count}</td>
                      <td>{c.first.yearWeek}</td>
                      <td>{c.last.yearWeek}</td>
                    </tr>
                  ))
                }
                </tbody>
              </Table>
            </div>

          </>) :
          null
      }
    </>);
  }


}
