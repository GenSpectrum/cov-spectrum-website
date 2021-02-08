import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { getGrowingVariants } from '../services/api';

// export class NewVariantTable extends React.Component {
export const NewVariantTable = ({ country, yearWeek, onVariantSelect }) => {
  const [data, setData] = useState(null);
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     data: null,
  //     req: null,
  //   };
  // }

  // componentDidMount() {
  //   this.updateView();
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (prevProps.country !== this.props.country || prevProps.yearWeek !== this.props.yearWeek) {
  //     this.updateView();
  //   }
  // }

  // async updateView() {
  //   this.setState({ data: null });
  //   this.state.req?.cancel();

  //   const [year, week] = this.props.yearWeek.split('-');

  //   const endpoint = `/computed/find-growing-variants?year=${year}&week=${week}&country=${this.props.country}`;
  //   const req = BackendService.get(endpoint);
  //   this.setState({ req });
  //   const data = await (await req).json();

  //   this.setState({ data });
  // }

  // render() {

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    const [year, week] = yearWeek.split('-');
    getGrowingVariants(year, week, country, signal).then(newData => {
      if (isSubscribed) {
        setData(newData);
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
      console.log('TIME Cleanup render for variant age distribution plot');
    };
  }, [country, yearWeek, onVariantSelect]);

  return (
    <div>
      {data && (
        <div style={{ height: '400px', overflow: 'auto' }}>
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
              {data.map(d => (
                <tr key={d.variant.mutations.join(',')}>
                  <td style={{ maxWidth: '400px', lineBreak: 'auto' }}>{d.variant.mutations.join(', ')}</td>
                  <td>{d.t1Count}</td>
                  <td>
                    {d.t1Proportion.toFixed(4)} (+
                    {d.absoluteDifferenceProportion.toFixed(4)})
                  </td>
                  <td>{d.relativeDifferenceProportion?.toFixed(4)}</td>
                  <td>
                    <Button
                      onClick={() => {
                        onVariantSelect(d.variant);
                      }}
                      variant='outline-secondary'
                      size='sm'
                    >
                      Show Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
  // }
};
