import React from "react";
import { BackendService } from "../services/BackendService";

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from 'react-plotly.js/factory';
import { Utils } from "../services/Utils";

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);


export class VariantTimeDistributionPlot extends React.Component {

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
    urlSearchParams.append('country', data.country);
    urlSearchParams.append('matchPercentage', data.matchPercentage);
    urlSearchParams.append('mutations', data.mutations.join(','));
    return 'variant_time-distribution?' + urlSearchParams.toString();
  }


  constructor(props) {
    super(props);
    this.state = {
      distribution: null,
      req: null
    };
  }


  componentDidMount() {
    this.updateView();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    // TODO Use a better equality check for the variant
    if (!Utils.deepEqual(prevProps.data, this.props.data)) {
      this.updateView();
    }
  }


  async updateView() {
    this.state.req?.cancel();
    this.setState({ distribution: null });

    const mutationsString = this.props.data.mutations.join(',');
    const endpoint = '/plot/variant/time-distribution';
    const req
      = BackendService.get(`${endpoint}?country=${this.props.data.country}&mutations=${mutationsString}` +
      `&matchPercentage=${this.props.data.matchPercentage}`);
    this.setState({ req });
    const distribution = await (await req).json();

    this.setState({ distribution })
  }


  render() {
    return (
      <div style={{ height: '100%' }}>
        {this.state.distribution &&
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              type: 'bar',
              x: this.state.distribution.map(d => new Date(d.x.firstDayInWeek)),
              y: this.state.distribution.map(d => d.y.count)
            },
            {
              x: this.state.distribution.map(d => new Date(d.x.firstDayInWeek)),
              y: this.state.distribution.map(d => d.y.proportion.value * 100),
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'red' },
              yaxis: 'y2'
            }
          ]}
          layout={{
            title: 'Time Distribution',
            yaxis: {
              title: 'Number Sequences'
            },
            yaxis2: {
              title: 'Estimated Percentage',
              overlaying: 'y',
              side: 'right'
            },
            showlegend: false
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
