import React, { useContext } from 'react';
import { ButtonVariant, DropdownButton } from '../../helpers/ui';
import { PprettyGridExportManagerContext } from './PprettyGridExportManager';
import { Dropdown } from 'react-bootstrap';
import { pprettyFileFormats } from '../../data/ppretty/ppretty-request';
import { getPlotUrl } from '../../data/ppretty/api-ppretty';

export const PprettyGridExportButton = () => {
  const exportManager = useContext(PprettyGridExportManagerContext);

  return (
    <DropdownButton variant={ButtonVariant.PRIMARY}>
      {pprettyFileFormats.map(format => (
        <Dropdown.Item
          key={format}
          onClick={async () => {
            const pprettyRequest = exportManager.getMergedRequest();
            if (pprettyRequest === null) {
              return;
            }
            const pprettyUrl = await getPlotUrl(pprettyRequest, format);
            window.open(pprettyUrl);
          }}
        >
          Download {format.toUpperCase()}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};
