import { Theme } from '@material-ui/core';

export class ThemeUtils {

    static spacingInPixels(theme: Theme, value: number): string {
        return `${theme.spacing(value)}px`;
    }

}
