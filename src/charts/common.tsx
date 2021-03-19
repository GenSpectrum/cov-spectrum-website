import styled from 'styled-components';

export const colors = {
  active: '#2980b9',
  inactive: '#bdc3c7',
  active2: '#3498db',
  secondary: '#7f8c8d',
};


export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
export const TitleWrapper = styled.div`
  padding: 0.5rem 0rem 1rem 0rem;
  font-size: 1.2rem;
  line-height: 1.3;
  color: ${colors.secondary};
`;
export const ChartAndMetricsWrapper = styled.div`
  display: flex;
  flex: 1;
`;

export const ChartWrapper = styled.div`
  flex-grow: 1;
  width: 10rem;
`;
