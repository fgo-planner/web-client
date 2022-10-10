import { Theme } from '@mui/material';
import { CSSInterpolation, MuiStyledOptions, styled, Theme as SystemTheme } from '@mui/system';
import { ThemeConstants } from '../../styles/theme-constants';

const StyleOptions = {
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions;

const StyleProps = (props: { theme: SystemTheme }) => {

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

export const SectionTitle = styled('div', StyleOptions)(StyleProps);
