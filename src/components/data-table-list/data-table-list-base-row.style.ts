import { Theme } from '@mui/material';
import { alpha, CSSInterpolation } from '@mui/system';
import { StyledFunctionPropsWithTheme } from '../../types/internal';

export const DefaultStyleClassPrefix = 'DataTableListRow';

// TODO Add class for pointer cursor.
export const DataTableListBaseRowStyle = (props: StyledFunctionPropsWithTheme) => {

    const {
        classPrefix = DefaultStyleClassPrefix,
        forRoot,
        theme
    } = props;

    const {
        palette
    } = theme as Theme;

    const style = {
        '&:hover': {
            backgroundColor: alpha(palette.text.primary, 0.07)
        },
        [`&.${classPrefix}-active`]: {
            backgroundColor: `${alpha(palette.primary.main, 0.07)} !important`,
            '&:hover': {
                backgroundColor: `${alpha(palette.primary.main, 0.12)} !important`,
            }
        },
        [`&.${classPrefix}-border-top`]: {
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: palette.divider,
        },
        [`&.${classPrefix}-border-bottom`]: {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider,
        },
        [`& .${classPrefix}-sticky-content`]: {
            backgroundColor: palette.background.paper,
            position: 'sticky',
            left: 0,
            zIndex: 1  // 1 should be enough for now
        }
    } as CSSInterpolation;

    if (forRoot) {
        return style;
    }

    return {
        [`& .${classPrefix}-root`]: style
    } as CSSInterpolation;

};
