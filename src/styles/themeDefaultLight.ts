import { alpha, ThemeOptions } from '@mui/material';
import { lightBlue, pink } from '@mui/material/colors';
import { BreakpointOverrides } from './MuiBreakpointOverrides';
import { ComponentsOverrides } from './MuiComponentsOverrides';
import { ThemeConstants } from './ThemeConstants';

const themeDefaultLight = () => {
    return {
        spacing: ThemeConstants.spacingFunction,
        palette: {
            mode: 'light',
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
            divider: alpha('#000000', 0.12),
            drawer: {
                main: lightBlue[600]
            }
        },
        breakpoints: BreakpointOverrides,
        components: ComponentsOverrides
    } as ThemeOptions;
};

export default themeDefaultLight;
