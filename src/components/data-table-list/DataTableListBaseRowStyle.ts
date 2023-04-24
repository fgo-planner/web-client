import { Theme } from '@mui/material';
import { alpha, CSSInterpolation } from '@mui/system';
import { ThemeConstants } from '../../styles/ThemeConstants';
import { StyledFunctionPropsWithTheme } from '../../types';

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
        boxSizing: 'content-box',
        '&:hover': {
            backgroundColor: alpha(palette.text.primary, ThemeConstants.HoverAlpha)
        },
        [`&.${classPrefix}-active`]: {
            backgroundColor: `${alpha(palette.primary.main, ThemeConstants.ActiveAlpha)} !important`,
            '&:hover': {
                backgroundColor: `${alpha(palette.primary.main, ThemeConstants.ActiveHoverAlpha)} !important`
            }
        },
        [`&.${classPrefix}-border-top`]: {
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: palette.divider
        },
        [`&.${classPrefix}-border-bottom`]: {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider
        },
        [`&.${classPrefix}-no-pointer-events`]: {
            '> *': {
                pointerEvents: 'none'
            }
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
