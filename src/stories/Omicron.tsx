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

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <>
      <hr className='pt-4' />
      <h2>{title}</h2>
    </>
  );
};

enum STATUS {
  WARNING = 'red-100',
  DEFAULT = 'yellow-100',
  SECONDARY = 'gray-100',
}

const StatusBox = ({
  title,
  description,
  type = STATUS.DEFAULT,
}: {
  title: string;
  description?: string;
  type?: STATUS;
}) => {
  return (
    <div className={`bg-${type} rounded-xl px-4 py-2 my-4`}>
      <h2 className=''>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
};

const Omicron = () => {
  return (
    <div className='mx-auto max-w-5xl px-4 py-2'>
      <h1>Tracking B.1.1.529 Omicron, a more contagious variant?</h1>
      <StatusBox
        title='Scientists are concerned'
        description=' Not much about this variant is known yet. There are concerns that it may be more contagious and
          vaccines less effective compared to the dominant Delta variant. Scientists are working hard to
          analyze more samples to better understand the situation.'
        type={STATUS.WARNING}
      />

      <SectionTitle title='Global spread' />
      <StatusBox
        title='Cases detected in multiple countries'
        description='Omicron cases have been detected in multiple countries'
        type={STATUS.SECONDARY}
      />

      <SectionTitle title='Articles' />
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
