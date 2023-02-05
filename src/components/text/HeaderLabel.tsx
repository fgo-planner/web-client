import { CSSInterpolation, MuiStyledOptions, styled } from '@mui/system';
import { ThemeConstants } from '../../styles/ThemeConstants';

const StyleOptions = {
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions;

const StyleProps = {
    fontFamily: ThemeConstants.FontFamilyGoogleSans,
    fontWeight: 500,
    fontSize: '0.9375rem',
    textAlign: 'center',
    overflow: 'hidden',
    userSelect: 'none'
} as CSSInterpolation;

export const HeaderLabel = styled('div', StyleOptions)(StyleProps);
