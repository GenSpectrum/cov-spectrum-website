import React from "react";
import { BackendService } from "../services/BackendService";
import Table from "react-bootstrap/Table";
import { Utils } from "../services/Utils";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { VariantInternationalComparisonPlot } from "../widgets/VariantInternationalComparisonPlot";
import { WidgetWrapper } from "./WidgetWrapper";


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
    if (prevProps.variant !== this.props.variant || prevProps.country !== this.props.country
      || prevProps.matchPercentage !== this.props.matchPercentage) {
      this.updateView();
    }
  }


  async updateView() {
    this.loadInternationalTimeDistribution();
  }


  async loadInternationalTimeDistribution() {
    this.setState({ distribution: null });
    const mutationsString = this.props.variant.mutations.join(',');
    const endpoint = '/plot/variant/international-time-distribution';
    const distribution
      = await BackendService.get(`${endpoint}?mutations=${mutationsString}` +
      `&matchPercentage=${this.props.matchPercentage}`);
    this.setState({ distribution });
  }


  render() {
    const aggregated = Utils.groupBy(this.state.distribution, d => d.x.country);
    const countryData = [];
    aggregated?.forEach((value, name) => {
      countryData.push(value.reduce((aggregated, entry) => ({
        country: aggregated.country,
        count: aggregated.count + entry.y.count,
        first: Utils.minBy(aggregated.first, entry.x.week, w => w.firstDayInWeek),
        last: Utils.maxBy(aggregated.last, entry.x.week, w => w.firstDayInWeek),
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

    const plotData = {
      country: this.props.country,
      matchPercentage: this.props.matchPercentage,
      mutations: this.props.variant.mutations
    };

    return (<>
      <div style={{ display: 'flex' }}>
        <h3 style={{ flexGrow: 1 }}>
          {this.props.variant.name ?? 'Unnamed Variant'} - International Comparison
        </h3>
        <div>
          <Link
            to={'/sample?mutations=' + this.props.variant.mutations.join(',') +
            '&matchPercentage=' + this.props.matchPercentage}
          >
            <Button
              variant="outline-dark"
              size="sm"
            >Show all samples</Button>
          </Link>
        </div>
      </div>
      <div style={{ height: '500px' }}>
        <WidgetWrapper shareUrl={VariantInternationalComparisonPlot.dataToUrl(plotData)}>
          <VariantInternationalComparisonPlot data={plotData} />
        </WidgetWrapper>
      </div>
      {
        countryData ? (<>
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <Table striped bordered hover>
                <thead>
                <tr>
                  <th>Country</th>
                  <th>Total Variant Sequences</th>
                  <th>First seq. found at</th>
                  <th>Last seq. found at</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>
                {
                  countryData.map(c => (
                    <tr key={c.country}>
                      <td>{c.country}</td>
                      <td>{c.count}</td>
                      <td>{c.first.yearWeek}</td>
                      <td>{c.last.yearWeek}</td>
                      <td>
                        <Link
                          to={'/sample?mutations=' + this.props.variant.mutations.join(',') +
                          '&country=' + c.country +
                          '&matchPercentage=' + this.props.matchPercentage}
                        >
                          <Button
                            variant="outline-dark"
                            size="sm"
                          >Show samples</Button>
                        </Link>
                      </td>
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
