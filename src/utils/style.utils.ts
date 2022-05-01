import { SxProps, Theme } from '@mui/system';

export class StyleUtils {

    private constructor () {
        
    }

    static filterClasses(target: Record<string, string>, source: Record<string, string>): Record<string, string> {
        const result: Record<string, string> = {};
        for (const key in target) {
            const value = source[key];
            if (value === undefined) {
                continue;
            }
            result[key] = value;
        }
        return result;
    }

    static insetBoxShadow(boxShadow: string): string {
        boxShadow = boxShadow.replaceAll(/,\s*(\d+px)/gi, ', inset $1');
        return `inset ${boxShadow}`;
    }

    static mergeSxProps(sxProps1: SxProps<Theme>, sxProps2: SxProps<Theme> | undefined): SxProps<Theme> {
        if (!sxProps2) {
            return sxProps1;
        }
        if (Array.isArray(sxProps1)) {
            if (Array.isArray(sxProps2)) {
                return [...sxProps1, ...sxProps2];
            } else {
                return [...sxProps1, sxProps2];
            }
        }
        if (Array.isArray(sxProps2)) {
            return [sxProps1, ...sxProps2];
        }
        return [sxProps1, sxProps2];
    }

}
