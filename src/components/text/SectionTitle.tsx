import { Theme } from '@mui/material';
import { CSSInterpolation, MuiStyledOptions, styled } from '@mui/system';
import { ThemeConstants } from '../../styles/ThemeConstants';
import { StyledFunctionThemeProp } from '../../types';

const StyledOptions = {
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions;

const StyleProps = (props: StyledFunctionThemeProp) => {

    const { spacing } = props.theme as Theme;

    return {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 'normal',
        fontSize: '1.125rem',
        lineHeight: 1.6,
        letterSpacing: '0.0075em',
        padding: spacing(4, 6)
    } as CSSInterpolation;
};

export const SectionTitle = styled('div', StyledOptions)(StyleProps);
