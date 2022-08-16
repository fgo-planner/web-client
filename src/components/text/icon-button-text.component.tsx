import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSProperties } from '@mui/styles';
import { styled } from '@mui/system';
import { ThemeConstants } from '../../styles/theme-constants';
import { StyledFunctionThemeProp } from '../../types/internal';

type Props = {
    textDecoration?: CSSProperties['textDecoration']
};

const StyleClassPrefix = 'DataTableGridCell';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'textDecoration'
);

const StyledOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipSx: true,
    skipVariantsResolver: true,
    shouldForwardProp
} as FilteringStyledOptions<Props>;

const StyledProps = ({ textDecoration }: Props & StyledFunctionThemeProp) => ({
    width: '24px',
    height: '24px',
    fontFamily: ThemeConstants.FontFamilyGoogleSans,
    fontSize: '1.125rem',
    fontWeight: 600,
    textDecoration
} as CSSProperties);

export const IconButtonText = styled('div', StyledOptions)<Props>(StyledProps);
