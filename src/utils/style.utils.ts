import { Nullable } from '../types/internal';

export class StyleUtils {

    /**
     * @deprecated Use the `clsx` library instead.
     */
    static appendClassNames(...classNames: Nullable<string | false>[]) {
        if (!classNames.length) {
            return '';
        }
        if (classNames.length === 1) {
            return classNames[0] || '';
        }
        let result = '';
        for (const className of classNames) {
            if (!className) {
                continue;
            }
            result += result.length ? ` ${className}` : className;
        }
        return result;
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

}
