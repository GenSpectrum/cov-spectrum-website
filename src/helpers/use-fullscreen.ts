import { useEffect, useState } from 'react';

export function useFullscreenStatus(): boolean {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(document.fullscreenElement !== null);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  return isFullscreen;
}
