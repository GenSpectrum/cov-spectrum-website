import React, { useContext, useState } from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { ExportManagerContext, RegisteredExport } from './ExportManager';
import { sortBy } from 'lodash';

export const ExportButton = () => {
  const [items, setItems] = useState<RegisteredExport[]>([]);

  const exportManager = useContext(ExportManagerContext);

  return (
    <DropdownButton
      title='Export'
      onClick={() => setItems(sortBy([...exportManager.getRegistered()], ({ label }) => label))}
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
