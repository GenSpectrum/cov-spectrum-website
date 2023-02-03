import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { MinProportionSlider, MinProportionSliderProps } from './Slider';

type ToolOverlaySliderProps = MinProportionSliderProps;

export function PercentageValueWithOverlaySlider({
  percentageValue,
  setPercentageValue,
}: ToolOverlaySliderProps) {
  return (
    <OverlayTrigger
      trigger='click'
      overlay={
        <Tooltip id='mutationMinProportion'>
          <div>
            <MinProportionSlider percentageValue={percentageValue} setPercentageValue={setPercentageValue} />
          </div>
        </Tooltip>
      }
      rootClose={true}
      placement='bottom'
    >
      <span className='cursor-pointer px-3 rounded bg-gray-100 hover:bg-gray-300 font-bold'>
        {(percentageValue * 100).toFixed(0)}%
      </span>
    </OverlayTrigger>
  );
}
