import { ThemeOptions } from '@material-ui/core';
import { ThemeConstants } from './theme-constants';

const spacing = (scale: number) => {
    return `${ThemeConstants.Spacing * scale}px`;
};

const Options: ThemeOptions = {
    overrides: {
        MuiButton: {
            root: {
                textTransform: 'none'
            }
        },
        MuiTextField: {
            root: {
                margin: spacing(3)
            }
        }
    }
};

export default Options.overrides;
