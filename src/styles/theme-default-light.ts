import overrides from './material-ui-overrides';
import { ThemeOptions } from '@material-ui/core';
import { ThemeConstants } from './theme-constants';
import { grey, lightBlue, pink } from '@material-ui/core/colors';

const themeDefaultLight = () => {
    const theme: ThemeOptions = {
        spacing: ThemeConstants.Spacing,
        palette: {
            background: {
                default: 'white'
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
