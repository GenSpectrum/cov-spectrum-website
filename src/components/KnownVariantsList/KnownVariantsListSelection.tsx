import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { VariantList } from './KnownVariantsList';

type CustomToggleProps = {
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {};
};

type CustomMenuProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

const CustomToggle = React.forwardRef(
  ({ children, onClick }: CustomToggleProps, ref: React.Ref<HTMLButtonElement>) => (
    <button className='outline-none' ref={ref} onClick={e => onClick(e)}>
      {children} &#x25bc;
    </button>
  )
);

const CustomMenu = React.forwardRef(
  ({ children, style, className }: CustomMenuProps, ref: React.Ref<HTMLDivElement>) => {
    return (
      <div ref={ref} style={style} className={className}>
        <ul>
          {React.Children.toArray(children).map(child => (
            <li className='m-0'>{child}</li>
          ))}
        </ul>
      </div>
    );
  }
);

type Props = {
  variantLists: VariantList[];
  selected: string;
  onSelect: (name: string) => void;
};

export const KnownVariantsListSelection = ({ variantLists, selected, onSelect }: Props) => {
  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle}>{selected}</Dropdown.Toggle>
      <Dropdown.Menu as={CustomMenu}>
        {variantLists.map(({ name }) => (
          <Dropdown.Item active={name === selected} onClick={() => onSelect(name)}>
            {name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
