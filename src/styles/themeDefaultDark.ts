import { alpha, ThemeOptions } from '@mui/material';
import { pink } from '@mui/material/colors';
import { BreakpointOverrides } from './MuiBreakpointOverrides';
import { ComponentsOverrides } from './MuiComponentsOverrides';
import { ThemeConstants } from './ThemeConstants';

const themeDefaultDark = () => {
    return {
        spacing: ThemeConstants.spacingFunction,
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
            divider: '#001E3C',
            drawer: {
                main: '#000F1F'
            }
        },
        breakpoints: BreakpointOverrides,
        components: ComponentsOverrides
    } as ThemeOptions;
};

export default themeDefaultDark;
