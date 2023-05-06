import { Theme } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSInterpolation, styled } from '@mui/system';
import { StyledFunctionThemeProp } from '../../types';

type Props = {
    backgroundColor?: string;
    bold?: boolean;
    color?: string;
};

/**
 * Equivalent to 52px at 16px font-size.
 */
const DefaultSize = '3.25em';

const StyleClassPrefix = 'DataTableGridCell';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'backgroundColor' &&
    prop !== 'bold' &&
    prop !== 'color'
);

const StyledOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipSx: true,
    skipVariantsResolver: true,
    shouldForwardProp
} as FilteringStyledOptions<Props>;

const Style = (props: Props & StyledFunctionThemeProp) => {

    const {
        backgroundColor,
        bold,
        color,
        theme
    } = props;

    const { palette } = theme as Theme;

    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: DefaultSize,
        height: DefaultSize,
        boxSizing: 'border-box',
        backgroundColor,
        color,
        fontWeight: bold ? 500 : undefined,
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: palette.divider
    } as CSSInterpolation;
};

export const DataTableGridCell = styled('div', StyledOptions)<Props>(Style);
