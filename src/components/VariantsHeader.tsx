import React from 'react';
import { formatVariantDisplayName, VariantSelector } from '../data/VariantSelector';
import { IoIosCloseCircleOutline } from 'react-icons/io';

export interface Props {
  variants?: VariantSelector[];
  titleSuffix?: React.ReactChild | React.ReactChild[];
  controls?: React.ReactChild | React.ReactChild[];
  onVariantSelect: (selection: VariantSelector) => void;
}

export const CompareVariantsHeader = ({ variants, titleSuffix, controls, onVariantSelect }: Props) => {
  return (
    <div className='pt-10 lg:pt-0 ml-1 my-2 md:ml-3 w-full relative'>
      <div className='flex'>
        <div className='flex-grow flex flex-row flex-wrap items-end'>
          {variants && variants.length > 0 ? (
            variants.map(variant => (
              <button
                className='bg-blue-500 hover:bg-blue-700 text-white rounded mr-2 py-1 px-2 inline-flex items-center'
                onClick={() => onVariantSelect(variant)}
              >
                {!variant.variantQuery ? (
                  <>{formatVariantDisplayName(variant)}</>
                ) : (
                  <>{variant.variantQuery}</>
                )}
                {!!titleSuffix && ' - '}
                {titleSuffix}
                <IoIosCloseCircleOutline className='ml-2 text-xl' />
              </button>
            ))
          ) : (
            <h1 className='md:mr-2'>All lineages</h1>
          )}
        </div>
      </div>
    </div>
  );
};
