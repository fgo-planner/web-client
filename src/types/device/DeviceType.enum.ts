const Phone = 0;
const Tablet = 1;
const Desktop = 2;

export type DeviceType =
    typeof Phone |
    typeof Tablet |
    typeof Desktop;

export const DeviceType = {
    Phone,
    Tablet,
    Desktop
} as const;
