import { ThemeOptions } from '@material-ui/core';
import { ThemeConstants } from './theme-constants';

const spacing = (scale: number) => {
    return `${ThemeConstants.Spacing * scale}px`;
};

const overrides: ThemeOptions['overrides'] = {
    MuiButton: {
        contained: {
            backgroundColor: '#FFF'
        },
        label: {
            fontFamily: ThemeConstants.FontFamilyGoogleSans,
            letterSpacing: '0.25px',
            textTransform: 'none'
        }
    },
    MuiFab: {
        root: {
            backgroundColor: '#FFF'
        }
    },
    MuiTextField: {
        root: {
            // margin: spacing(3)
        }
    },
    MuiTypography: {
        h6: {
            fontFamily: ThemeConstants.FontFamilyGoogleSans
        }
    }
};

export default overrides;
