import overrides from './material-ui-overrides';
import { ThemeOptions } from '@material-ui/core';
import { ThemeConstants } from './theme-constants';

export default () => {
    const theme: ThemeOptions = {
        spacing: ThemeConstants.Spacing,
        palette: {
            background: {
                default: '#FFF'
            },
            primary: {
                main: '#EC407A'
            },
            secondary: {
                main: '#039BE5'
            }
        },
        overrides
    };
    return theme;
};