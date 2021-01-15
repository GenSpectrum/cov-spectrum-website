import React from "react";
import Table from "react-bootstrap/Table";
import { BackendService } from "./BackendService";
import { Button } from "react-bootstrap";


export class NewVariantTable extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }


  componentDidMount() {
    console.log(1);
    this.updateView();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.country !== this.props.country || prevProps.yearWeek !== this.props.yearWeek) {
      this.updateView();
    }
  }


  async updateView() {
    this.setState({ data: null });
    const [year, week] = this.props.yearWeek.split('-');

    const data = await BackendService.get(`/variant?year=${year}&week=${week}&country=${this.props.country}`);
    this.setState({ data });
  }


  render() {
    return (
      <div>
        {
          this.state.data &&
          <Table striped bordered hover>
            <thead>
            <tr>
              <th>Mutations</th>
              <th># Sequences</th>
              <th>Proportion</th>
              <th>Relative Increase</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {
              this.state.data.map(d => (
                <tr>
                  <td>{d.variant.mutations.join(',')}</td>
                  <td>{d.t1Count}</td>
                  <td>{d.t1Proportion.toFixed(4)} (+ {d.absoluteDifferenceProportion.toFixed(4)})</td>
                  <td>{d.relativeDifferenceProportion?.toFixed(4)}</td>
                  <td><Button variant="outline-secondary" size="sm">Show Details</Button></td>
                </tr>
              ))
            }
            </tbody>
          </Table>
        }
      </div>
    );
  }
}
