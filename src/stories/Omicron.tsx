import React from 'react';

const UpdateBox = ({
  title,
  url,
  description,
  source,
}: {
  title: string;
  url: string;
  description?: string;
  source: string;
}) => {
  return (
    <div
      className='bg-yellow-100 rounded-xl shadow px-4 py-2 my-4 cursor-pointer'
      onClick={() => window.open(url, '_blank')}
    >
      <h2 className='underline'>{title}</h2>
      {description && <p>{description}</p>}
      <p className='text-gray-500'>{source}</p>
    </div>
  );
};

const Omicron = () => {
  return (
    <div className='mx-auto max-w-5xl px-4 py-2'>
      <h1>Tracking B.1.1.529 (Omicron) variant</h1>
      <div className='bg-red-100 px-4 py-2 rounded-lg shadow my-2'>
        <h2>Scientists are concerned</h2>
        <p>
          Not much about this variant is known yet. There are concerns that it may be more contagious and
          vaccines less effective compared to the dominant Delta variant. Scientists are working hard to
          analyze more samples to better understand the situation.
        </p>
      </div>

      {/* <hr className='mt-4' />
      <h2>Global spread</h2>
      <p>International Comparison</p>
      <p>Global map visual of the variant</p> */}

      <hr className='mt-4' />
      <h2>Updates</h2>
      <UpdateBox
        title='Classification of Omicron (B.1.1.529): SARS-CoV-2 Variant of Concern'
        url='https://www.who.int/news/item/26-11-2021-classification-of-omicron-(b.1.1.529)-sars-cov-2-variant-of-concern'
        source='World Health Organization'
      />
      <UpdateBox
        title='Countries ban travellers from southern Africa over Covid variant'
        url='https://www.ft.com/content/b8ca4536-07b2-463f-bb44-8159aaec89ab'
        description='UK warns B.1.1.529 strain ‘may be more transmissible’ than Delta and vaccines ‘may be less effective’.'
        source='Financial Times'
      />
    </div>
  );
};

export default Omicron;
