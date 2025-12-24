import React, { useState } from 'react';
import { HeaderCountrySelect } from '../../components/HeaderCountrySelect';
import { AiOutlineMenu } from 'react-icons/ai';
import { FaFilter } from 'react-icons/fa';
import { Button, ButtonVariant } from '../../helpers/ui';
import { useExploreUrl } from '../../helpers/explore-url';
import { HeaderSamplingStrategySelect } from '../../components/HeaderSamplingStrategySelect';
import { AlmostFullscreenModal } from '../../components/AlmostFullscreenModal';
import { AdvancedFiltersPanel } from '../../components/AdvancedFiltersPanel';
import { Logo } from './Logo';
import { OpenDataSource } from './DataSource';
import { DrawerNavigation } from './DrawerNavigation';
import { TopNavigation } from './TopNavigation';

const Header = ({ hideInternalLinks }: { hideInternalLinks?: true }) => {
  const [showAdvancedFilteringModal, setShowAdvancedFilteringModal] = useState(false);
  const [showDrawerNavigation, setShowDrawerNavigation] = useState(false);

  return (
    <>
      <DrawerNavigation
        show={showDrawerNavigation}
        onClose={() => setShowDrawerNavigation(false)}
        setShowAdvancedFilteringModal={setShowAdvancedFilteringModal}
      />
      <div className='flex h-full content-center shadow-md z-50 bg-white pb-2'>
        <div className='w-full mx-auto px-2 md:px-0 flex content-center'>
          <div className='md:mx-4 w-full justify-between'>
            <div className='w-full h-full flex justify-center md:justify-between items-center'>
              <div id='logo-and-search' className='flex h-full md:flex-row flex-column justify-center'>
                <div id='logo-and-gsid' className='flex flex-column items-center justify-center md:pr-4'>
                  <Logo />
                  <OpenDataSource />
                </div>
                <div className='lg:hidden'>
                  <OpenDrawerNavigationButton setShowOffCanvas={setShowDrawerNavigation} />
                </div>
                <LocationAndAdvancedFilter
                  onAdvancedButtonClick={() => setShowAdvancedFilteringModal(true)}
                />
              </div>
              <div className='hidden lg:block'>
                <TopNavigation hideInternalLinks={hideInternalLinks} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdvancedFilterModal
        show={showAdvancedFilteringModal}
        handleClose={() => setShowAdvancedFilteringModal(false)}
      />
    </>
  );
};

function OpenDrawerNavigationButton({
  setShowOffCanvas,
}: {
  setShowOffCanvas: (value: ((prevState: boolean) => boolean) | boolean) => void;
}) {
  return (
    <button
      onClick={() => setShowOffCanvas(true)}
      className='outline-none border-solid border border-gray-400 p-1 rounded-lg absolute '
      style={{ top: 7, right: 7 }}
    >
      <AiOutlineMenu size='1.5em' />
    </button>
  );
}

function LocationAndAdvancedFilter({ onAdvancedButtonClick }: { onAdvancedButtonClick: () => void }) {
  const exploreUrl = useExploreUrl();

  return (
    <div className='flex flex-wrap items-center justify-center gap-y-2 z-20 mt-2 md:mt-0'>
      <div className='flex-grow'>
        <HeaderCountrySelect />
      </div>
      <div className='flex-grow'>
        <HeaderSamplingStrategySelect />
      </div>
      {exploreUrl && (
        <Button variant={ButtonVariant.SECONDARY} onClick={onAdvancedButtonClick} className='hidden lg:block'>
          Advanced <FaFilter className='inline' />
        </Button>
      )}
    </div>
  );
}

function AdvancedFilterModal(props: { show: boolean; handleClose: () => void }) {
  return (
    <AlmostFullscreenModal header='Advanced filters' show={props.show} handleClose={props.handleClose}>
      <AdvancedFiltersPanel onClose={props.handleClose} />
    </AlmostFullscreenModal>
  );
}

export default Header;
