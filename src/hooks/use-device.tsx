import * as React from 'react';

export type DeviceClass = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  width: number;
  height: number;
  device: DeviceClass;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  isLandscape: boolean;
  /** short-height landscape phones/foldables — canvas should take over */
  isCompactLandscape: boolean;
}

const read = (): DeviceInfo => {
  const width = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const height = typeof window === 'undefined' ? 800 : window.innerHeight;
  const device: DeviceClass = width < 768 ? 'mobile' : width < 1200 ? 'tablet' : 'desktop';
  const isLandscape = width > height;
  return {
    width,
    height,
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    isTouch: typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    orientation: isLandscape ? 'landscape' : 'portrait',
    isLandscape,
    isCompactLandscape: isLandscape && height < 560,
  };
};

export function useDevice(): DeviceInfo {
  const [info, setInfo] = React.useState<DeviceInfo>(read);

  React.useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setInfo(read()));
    };
    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return info;
}
