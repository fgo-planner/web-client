import { alpha, DeprecatedThemeOptions } from '@mui/material';
import { pink } from '@mui/material/colors';
import overrides from './material-ui-overrides';
import breakpoints from './theme-breakpoints';
import { ThemeConstants } from './theme-constants';

const themeDefaultDark = () => {
    return {
        spacing: ThemeConstants.Spacing,
        palette: {
            mode: 'dark',
            background: {
                default: alpha('#001E3C', 0.91),
                paper: '#1A344F'

            },
            primary: {
                main: '#BADA55'
            },
            secondary: {
                main: pink[200]
            },
            divider: '#001E3C'
        },
        breakpoints,
        overrides
    } as DeprecatedThemeOptions;
};

export default themeDefaultDark;
