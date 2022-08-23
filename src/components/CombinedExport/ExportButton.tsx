import { sortBy } from '../../helpers/lodash_alternatives';
import React, { useContext, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { ButtonVariant, DropdownButton } from '../../helpers/ui';
import { ExportManagerContext, RegisteredExport } from './ExportManager';

interface Props {
  className?: string;
}

export const ExportButton = ({ className }: Props) => {
  const [items, setItems] = useState<RegisteredExport[]>([]);

  const exportManager = useContext(ExportManagerContext);

  return (
    <DropdownButton
      className={className}
      onToggle={() => setItems([...exportManager.getRegistered()].concat().sort(sortBy('label')))}
      variant={ButtonVariant.SECONDARY}
    >
      {items.map(({ label, doExport }) => (
        <Dropdown.Item key={label} onClick={doExport}>
          {label}
        </Dropdown.Item>
      ))}
      {!items.length && <Dropdown.Item disabled>This item can not be exported</Dropdown.Item>}
    </DropdownButton>
  );
};
