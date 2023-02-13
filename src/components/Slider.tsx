import { styled } from '@mui/material/styles';
import { Slider } from '@mui/material';

export type MinProportionSliderProps = {
  percentageValue: number;
  setPercentageValue: (value: number) => void;
};

export function MinProportionSlider({ percentageValue, setPercentageValue }: MinProportionSliderProps) {
  return (
    <SliderWithoutShadowedThumb
      value={Math.round(percentageValue * 100)}
      min={5}
      max={100}
      step={5}
      onChange={(_, value) => setPercentageValue((value as number) / 100)}
      sx={{ width: '100px', marginX: 1 }}
      size='small'
    />
  );
}

const SliderWithoutShadowedThumb = styled(Slider)({
  '& .MuiSlider-thumb': {
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
  },
});
