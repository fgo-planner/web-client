import { CSSProperties, FilteringStyledOptions } from '@mui/styled-engine';
import { styled } from '@mui/system';

type Props = {
    borderTop?: boolean;
    borderBottom?: boolean;
};

const StyleClassPrefix = 'PlanRequirementsTableRow';

const StyleOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipSx: true,
    shouldForwardProp: ((prop: string) => (
        prop !== 'borderTop' &&
        prop !== 'borderBottom'
    )) as unknown
} as FilteringStyledOptions<Props>;

export const PlanRequirementsTableRow = styled('div', StyleOptions)<Props>(props => {
    const {
        borderTop,
        borderBottom,
        theme
    } = props;

    const style = {
        display: 'flex',
        width: 'fit-content'
    } as CSSProperties;

    if (borderTop) {
        style.borderTopWidth = 1;
        style.borderTopStyle = 'solid';
        style.borderTopColor = theme.palette.divider;
    }
    if (borderBottom) {
        style.borderBottomWidth = 1;
        style.borderBottomStyle = 'solid';
        style.borderBottomColor = theme.palette.divider;
    }

    return style as any;
});