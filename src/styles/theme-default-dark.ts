import { fade, ThemeOptions } from '@material-ui/core';
import { pink } from '@material-ui/core/colors';
import overrides from './material-ui-overrides';
import { ThemeConstants } from './theme-constants';

const themeDefaultDark = () => {
    const theme: ThemeOptions = {
        spacing: ThemeConstants.Spacing,
        palette: {
            type: 'dark',
            background: {
                // default: '#23272A',
                // paper: '#2C2F33'
                default: fade('#001E3C', 0.91),
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
        overrides
    };
    return theme;
};

export default themeDefaultDark;
