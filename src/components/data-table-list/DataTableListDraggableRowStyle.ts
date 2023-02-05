import { CSSInterpolation, Theme } from '@mui/material';
import { StyledFunctionPropsWithTheme } from '../../types';

export const StyleClassPrefix = 'DataTableListDraggableRow';

// TODO Add class for pointer cursor.
export const DataTableListDraggableRowStyle = (props: StyledFunctionPropsWithTheme) => {

    const {
        classPrefix = StyleClassPrefix,
        forRoot,
        theme
    } = props;

    const {
        palette,
        spacing
    } = theme as Theme;

    const style = {
        [`&.${classPrefix}-draggable`]: {
            display: 'flex',
            alignItems: 'center'
        },
        [`&.${classPrefix}-dragging`]: {
            borderBottom: `1px solid ${palette.divider}`,
        },
        [`& .${classPrefix}-sticky-content`]: {
            display: 'flex',
            alignItems: 'center',
            [`& .${classPrefix}-drag-handle`]: {
                cursor: 'grab',
                margin: spacing(0, 2),
                opacity: 0.5,
                '&.disabled': {
                    cursor: 'initial',
                    color: palette.text.disabled
                }
            }
        }
    } as CSSInterpolation;

    if (forRoot) {
        return style;
    }

    return {
        [`& .${classPrefix}-root`]: style
    } as CSSInterpolation;

};
