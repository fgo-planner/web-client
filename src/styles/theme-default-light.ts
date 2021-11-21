import { alpha, ThemeOptions } from '@mui/material';
import { lightBlue, pink } from '@mui/material/colors';
import { BreakpointOverrides } from './material-ui-breakpoints';
import { ComponentsOverrides } from './material-ui-components';
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
        breakpoints: BreakpointOverrides,
        components: ComponentsOverrides
    } as ThemeOptions;
};

export default themeDefaultLight;
