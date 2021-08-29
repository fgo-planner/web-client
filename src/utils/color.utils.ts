import { RgbaColor } from '@fgo-planner/types';
import { colord } from 'colord';

/**
 * @deprecated Use the 'colord' library instead.
 */
export class ColorUtils {

    static rgbaColorToString(rgbaColor: RgbaColor, compact = true): string {
        const { r, g, b, a } = rgbaColor;
        const space = compact ? '' : ' ';
        return `rgba(${r},${space}${g},${space}${b},${space}${a})`;
    }

    static stringToRgbaColor(colorString = ''): RgbaColor {
        return colord(colorString).toRgb();
    }

}
