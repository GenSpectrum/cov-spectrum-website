import React from 'react';
import { Integration } from '../services/external-integrations/Integration';
import { PangoLineageIntegration } from '../services/external-integrations/PangoLineageIntegration';
import { OutbreakInfoIntegration } from '../services/external-integrations/OutbreakInfoIntegration';
import { WikipediaIntegration } from '../services/external-integrations/WikipediaIntegration';
import { CoVariantsIntegration } from '../services/external-integrations/CoVariantsIntegration';
import { useState } from 'react';
import { UsherIntegration } from '../services/external-integrations/UsherIntegration';
import { sequenceDataSource } from '../helpers/sequence-data-source';
import { TaxoniumIntegration } from '../services/external-integrations/TaxoniumIntegration';
import { getCsvLinkToContributors, getCsvLinkToDetails, getLinkToFasta } from '../data/api-lapis';
import { useDeepCompareMemo } from '../helpers/deep-compare-hooks';
import { useAsync } from 'react-async';
import { OrderAndLimitConfig } from '../data/OrderAndLimitConfig';
import { NextcladeIntegration } from '../services/external-integrations/NextcladeIntegration';
import { LapisSelector } from '../data/LapisSelector';
import { ExternalLink } from './ExternalLink';

// mui stuff
import Button1 from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import DownloadIcon from '@mui/icons-material/Download';
import Divider from '@mui/material/Divider';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    'borderRadius': 6,
    'marginTop': theme.spacing(1),
    'minWidth': 180,
    'color': theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    'boxShadow':
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
      },
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
}));

export interface Props {
  selector: LapisSelector;
}

const integrations: Integration[] = [
  new WikipediaIntegration(),
  new PangoLineageIntegration(),
  new CoVariantsIntegration(),
  new OutbreakInfoIntegration(),
  new UsherIntegration(),
  new TaxoniumIntegration(),
  new NextcladeIntegration(),
];

export const FocusVariantHeaderControls = React.memo(({ selector }: Props): JSX.Element => {
  const [showDropdown, setShowDropdown] = useState(false);
  const showDropdownFunc = (_: any) => {
    setShowDropdown(!showDropdown);
  };
  const hideDropdownFunc = (_: any) => {
    setShowDropdown(false);
  };

  // Sequence list download
  // If the open version is used, all the metadata will be downloaded. If GISAID is used, only the contributors
  // will be downloaded.
  const getLinkFunc = sequenceDataSource === 'open' ? getCsvLinkToDetails : getCsvLinkToContributors;
  const linkToListPromise = useDeepCompareMemo(() => getLinkFunc(selector), [selector]);
  const { data: listLink } = useAsync({ promise: linkToListPromise });

  // FASTA download
  const orderAndLimit: OrderAndLimitConfig = {
    orderBy: 'random',
    limit: 10000,
  };
  const linkToFastaPromise = useDeepCompareMemo(
    () => getLinkToFasta(false, selector, orderAndLimit),
    [selector]
  );
  const { data: fastaLink } = useAsync({ promise: linkToFastaPromise });
  const linkToAlignedFastaPromise = useDeepCompareMemo(
    () => getLinkToFasta(true, selector, orderAndLimit),
    [selector]
  );
  const { data: alignedFastaLink } = useAsync({ promise: linkToAlignedFastaPromise });

  const listLink2: string | undefined =
    listLink &&
    listLink.replace('contributors', 'gisaid-epi-isl').replace('&downloadAsFile=true&dataFormat=csv', '') +
      '&orderBy=random';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorElSequence, setAnchorElSequence] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const openSequence = Boolean(anchorElSequence);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, sequence = false) => {
    if (sequence) {
      setAnchorElSequence(event.currentTarget);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = (sequence = false) => {
    if (sequence) {
      setAnchorElSequence(null);
    } else {
      setAnchorEl(null);
    }
  };

  return (
    <>
      <div style={{ marginRight: '30px' }}>
        <Button
          style={{ marginRight: '4px' }}
          id='demo-customized-button'
          aria-controls={openSequence ? 'demo-customized-menu' : undefined}
          aria-expanded={openSequence ? 'true' : undefined}
          variant='contained'
          disableElevation
          onClick={event => handleClick(event, true)}
          endIcon={<KeyboardArrowDownIcon />}
        >
          Sequence
        </Button>
        <StyledMenu
          disableScrollLock={true}
          id='demo-customized-menu'
          MenuListProps={{
            'aria-labelledby': 'demo-customized-button',
          }}
          anchorEl={anchorElSequence}
          open={openSequence}
          onClose={() => handleClose(true)}
        >
          <MenuItem disableRipple>
            <DownloadIcon />
            <ExternalLink url={listLink ?? ''}>Sequence list</ExternalLink>
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          {sequenceDataSource === 'gisaid' && (
            <MenuItem disableRipple>
              <ExternalLink url={listLink2 ?? ''}>GISAID list</ExternalLink>
            </MenuItem>
          )}

          {sequenceDataSource === 'open' && (
            <>
              <MenuItem disableRipple>
                <ExternalLink url={fastaLink ?? ''}>FASTA</ExternalLink>
              </MenuItem>

              <MenuItem disableRipple>
                <ExternalLink url={alignedFastaLink ?? ''}>FASTA (aligned)</ExternalLink>
              </MenuItem>
            </>
          )}
        </StyledMenu>

        <Button1
          id='basic-button'
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          Other websites
        </Button1>
        <Menu
          disableScrollLock={true}
          id='basic-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleClose(false)}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {integrations.map(integration => (
            <MenuItem onClick={() => integration.open(selector)}> {integration.name}</MenuItem>
          ))}
        </Menu>
      </div>
    </>
  );
});
