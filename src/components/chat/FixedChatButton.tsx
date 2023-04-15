import React from 'react';

export const FixedChatButton = () => {
  return (
    <a href='/chat'>
      <button
        className='
        fixed bottom-0 right-2 md:right-8 lg:right-24 xl:right-36 border-x border-t border-gray-200 rounded-t-lg
        px-16 pt-2 pb-1 bg-gray-200 hover:bg-indigo-100 text-lg font-bold shadow-2xl shadow-indigo-800 hover:text-black'
      >
        Chat
      </button>
    </a>
  );
};
