export const SplitParentWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className='md:grid md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 h-full'>{children}</div>;
};

export const SplitExploreWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className='px-2 pt-2 md:px-4 md:col-span-1 lg:col-span-1 2xl:col-span-1'>{children}</div>;
};

export const SplitFocusWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className='px-2 md:pt-2 md:px-5 md:col-span-3 lg:col-span-4 2xl:col-span-5'>{children}</div>;
};
