import { alpha, DeprecatedThemeOptions } from '@mui/material';
import { lightBlue, pink } from '@mui/material/colors';
import overrides from './material-ui-overrides';
import breakpoints from './theme-breakpoints';
import { ThemeConstants } from './theme-constants';

const themeDefaultLight = () => {
    return {
        spacing: ThemeConstants.Spacing,
        palette: {
            background: {
                default: alpha('#FFFFFF', 0.69),
                paper: '#FFFFFF'
            },
            primary: {
                main: pink[400]
            },
            secondary: {
                main: lightBlue[600]
            },
            /*
             * This is already the default value but we include it anyways so that it can be
             * picked up by the `ThemeService`.
             */
            divider: alpha('#000000', 0.12) 
        },
        breakpoints,
        overrides
    } as DeprecatedThemeOptions;
};

export default themeDefaultLight;
