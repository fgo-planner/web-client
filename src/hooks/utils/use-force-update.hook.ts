import { useCallback, useState } from 'react';

const incrementValue = (value: number): number => value + 1;

export const useForceUpdate = (): () => void => {
    const [, setValue] = useState<number>(0);
    return useCallback(() => setValue(incrementValue), []);
};
