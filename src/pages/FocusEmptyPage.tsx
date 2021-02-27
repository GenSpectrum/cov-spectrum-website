import styled from 'styled-components';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Message = styled.div`
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  color: #999;
`;

export const FocusEmptyPage = () => {
  return (
    <Wrapper>
      <Message>Please select a variant on the left.</Message>
    </Wrapper>
  );
};
