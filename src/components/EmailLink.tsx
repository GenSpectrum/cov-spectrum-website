import React from 'react';

type Props = {
  email: string;
  children?: React.ReactNode;
};

export const EmailLink = ({ email, children }: Props) => {
  return <a href={'mailto:' + email}>{children ? children : email}</a>;
};
