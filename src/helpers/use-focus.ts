import { MutableRefObject, useRef } from 'react';

export const useFocus = (): [MutableRefObject<any>, () => void] => {
  const htmlElRef = useRef<any>(null);
  const setFocus = () => {
    if (htmlElRef.current) {
      htmlElRef.current.focus();
    }
  };
  return [htmlElRef, setFocus];
};
