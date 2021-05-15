import { fade, ThemeOptions } from '@material-ui/core';
import { lightBlue, pink } from '@material-ui/core/colors';
import overrides from './material-ui-overrides';
import { ThemeConstants } from './theme-constants';

const themeDefaultLight = () => {
    const theme: ThemeOptions = {
        spacing: ThemeConstants.Spacing,
        palette: {
            background: {
                default: fade('#FFFFFF', 0.69),
                paper: '#FFFFFF'
            },
            primary: {
                main: pink[400]
            },
            secondary: {
                main: lightBlue[600]
            }
        },
        overrides
    };
    return theme;
};

export default themeDefaultLight;
