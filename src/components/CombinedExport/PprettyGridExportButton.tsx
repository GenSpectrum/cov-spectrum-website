import React, { useContext, useState } from 'react';
import { ButtonVariant, DropdownButton } from '../../helpers/ui';
import { PprettyGridExportManagerContext } from './PprettyGridExportManager';
import { Dropdown } from 'react-bootstrap';
import { pprettyFileFormats } from '../../data/ppretty/ppretty-request';
import { getPlotUrl } from '../../data/ppretty/api-ppretty';
import { PprettyAdvancedExportModal, PprettyAdvancedSetting } from './PprettyAdvancedExportModal';

export const PprettyGridExportButton = () => {
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const exportManager = useContext(PprettyGridExportManagerContext);

  const exportWithAdvancedSetting = async (setting: PprettyAdvancedSetting) => {
    setShowAdvancedModal(false);
    const pprettyRequest = exportManager.getMergedRequest();
    if (pprettyRequest === null) {
      return;
    }
    pprettyRequest.config = {
      ...pprettyRequest.config,
      sizeMultiplier: (pprettyRequest.config.sizeMultiplier ?? 1) * setting.sizeMultiplier,
      sizeRatio: setting.sizeRatio,
    };
    const pprettyUrl = await getPlotUrl(pprettyRequest, setting.format);
    window.open(pprettyUrl);
  };

  return (
    <>
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
        <Dropdown.Item onClick={() => setShowAdvancedModal(true)}>Advanced</Dropdown.Item>
      </DropdownButton>
      <PprettyAdvancedExportModal
        show={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        onSubmit={exportWithAdvancedSetting}
      />
    </>
  );
};
