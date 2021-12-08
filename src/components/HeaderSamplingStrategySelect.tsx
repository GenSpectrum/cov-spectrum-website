import { Form } from 'react-bootstrap';
import { useExploreUrl } from '../helpers/explore-url';
import { SamplingStrategy } from '../data/SamplingStrategy';

export const HeaderSamplingStrategySelect = () => {
  const exploreUrl = useExploreUrl();

  if (!exploreUrl) {
    return null;
  }

  return (
    <Form inline className='mr-3'>
      <div>
        <Form.Control
          as='select'
          custom
          id='samplingStrategySelect'
          value={exploreUrl.samplingStrategy}
          onChange={ev => exploreUrl.setSamplingStrategy(ev.target.value as SamplingStrategy)}
        >
          <option value={SamplingStrategy.AllSamples}>All samples</option>
          <option value={SamplingStrategy.Surveillance}>Surveillance</option>
        </Form.Control>
      </div>
    </Form>
  );
};
