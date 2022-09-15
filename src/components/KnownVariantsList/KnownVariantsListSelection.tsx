import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Collection } from '../../data/Collection';

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
  collections: Collection[];
  selected: number;
  onSelect: (id: number) => void;
};

export const KnownVariantsListSelection = ({ collections, selected, onSelect }: Props) => {
  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle}>{collections.find(c => c.id === selected)!.title}</Dropdown.Toggle>
      <Dropdown.Menu as={CustomMenu}>
        {collections.map(({ id, title }) => (
          <Dropdown.Item key={id} active={id === selected} onClick={() => onSelect(id!)}>
            <span className='text-gray-400 mr-1'>#{id}</span> {title}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
