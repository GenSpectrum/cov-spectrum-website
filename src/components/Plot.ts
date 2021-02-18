import createPlotlyComponent from 'react-plotly.js/factory';

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
const Plotly = window.Plotly;
export const Plot = createPlotlyComponent(Plotly);
