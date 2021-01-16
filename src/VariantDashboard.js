import React from "react";
import { BackendService } from "./BackendService";

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from 'react-plotly.js/factory';
const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);


export class VariantDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }


  componentDidMount() {
    this.updateView();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    // TODO Use a better equality check for the variant
    if (prevProps.country !== this.props.country || prevProps.variant !== this.props.variant) {
      this.updateView();
    }
  }


  async updateView() {
    const mutationsString = this.props.variant.mutations.join(',');
    const endpoint = '/variant/time-distribution';
    const data
      = await BackendService.get(`${endpoint}?country=${this.props.country}&mutations=${mutationsString}`);
    this.setState({ data })
  }


  render() {
    return (
      <div>
        {
          this.state.data ? (
            <Plot
              style={{width: '100%'}}
              data={[
                {
                  type: 'bar',
                  x: this.state.data.map(d => d.week),
                  y: this.state.data.map(d => d.count)
                },
                {
                  x: this.state.data.map(d => d.week),
                  y: this.state.data.map(d => d.proportion * 100),
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: {color: 'red'},
                  yaxis: 'y2'
                }
              ]}
              layout={{
                height: 500,
                title: 'Time Distribution',
                yaxis: {title: 'Number Sequences'},
                yaxis2: {
                  title: 'Estimated Percentage',
                  overlaying: 'y',
                  side: 'right'
                }
              }}
            />
          ) :
            null
        }
      </div>
    );
  }


}
