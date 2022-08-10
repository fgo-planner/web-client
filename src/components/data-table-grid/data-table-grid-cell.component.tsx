import { FilteringStyledOptions } from '@mui/styled-engine';
import { styled, Theme as SystemTheme } from '@mui/system';
import { CSSProperties } from '@mui/styles';
import { Theme } from '@mui/material';

type Props = {
    backgroundColor?: string;
    bold?: boolean;
    color?: string;
    size: number;
};

const StyleClassPrefix = 'DataTableGridCell';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'backgroundColor' &&
    prop !== 'bold' &&
    prop !== 'color' &&
    prop !== 'size'
);

const StyleOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipSx: true,
    skipVariantsResolver: true,
    shouldForwardProp
} as FilteringStyledOptions<Props>;

const StyleProps = (props: Props & { theme: SystemTheme }) => {

    const {
        backgroundColor,
        bold,
        color,
        size,
        theme
    } = props;

    const { palette } = theme as Theme;

    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        boxSizing: 'border-box',
        backgroundColor,
        color,
        fontSize: Math.ceil(size / 3) + 2,
        fontWeight: bold ? 500 : undefined,
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: palette.divider
    } as CSSProperties;
};

export const DataTableGridCell = styled('div', StyleOptions)<Props>(StyleProps);
