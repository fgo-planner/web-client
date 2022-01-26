import { FilteringStyledOptions } from '@mui/styled-engine';
import { styled } from '@mui/system';

type Props = {
    backgroundColor?: string;
    bold?: boolean;
    color?: string;
    size: number;
};

const StyleClassPrefix = 'PlanRequirementsTableCell';

const StyleOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipSx: true,
    shouldForwardProp: ((prop: string) => (
        prop !== 'backgroundColor' &&
        prop !== 'bold' &&
        prop !== 'color' &&
        prop !== 'size'
    )) as unknown
} as FilteringStyledOptions<Props>;

export const PlanRequirementsTableCell = styled('div', StyleOptions)<Props>(props => {
    const {
        backgroundColor,
        bold,
        color,
        size,
        theme
    } = props;

    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        backgroundColor,
        color,
        fontSize: Math.ceil(size / 3) + 2,
        fontWeight: bold ? 500 : undefined,
        borderLeftWidth: 1,
        borderLeftStyle: 'solid',
        borderLeftColor: theme.palette.divider,
    };
});
