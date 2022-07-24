import { CSSProperties } from '@mui/styles';
import { MuiStyledOptions, styled } from '@mui/system';
import { ThemeConstants } from '../../styles/theme-constants';

const StyleOptions = {
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions;

const StyleProps = {
    fontFamily: ThemeConstants.FontFamilyGoogleSans,
    fontWeight: 500,
    fontSize: '0.9375rem',
    textAlign: 'center',
    overflow: 'hidden'
} as CSSProperties;

export const HeaderLabel = styled('div', StyleOptions)(StyleProps);
