import overrides from './material-ui-overrides';
import { ThemeOptions } from '@material-ui/core';
import { ThemeConstants } from './theme-constants';

export default () => {
    const theme: ThemeOptions = {
        spacing: ThemeConstants.Spacing,
        palette: {
            type: 'dark',
            background: {
                default: '#23272A',
                paper: '#2C2F33'
            },
            primary: {
                main: '#BADA55'
            },
            secondary: {
                main: '#FA9'
            }
        },
        // overrides
    };
    return theme;
};