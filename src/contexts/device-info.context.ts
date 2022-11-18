import { createContext } from 'react';
import { DeviceInfo, DeviceType } from '../types';

export const DeviceInfoContext = createContext<DeviceInfo>({
    deviceType: DeviceType.Desktop,
    isMobile: false
});
