import { Components } from '@mui/material/styles';
import { ThemeConstants } from './theme-constants';

/**
 * Overrides default Material UI component styles.
 */
export const ComponentsOverrides: Components = {
    MuiButton: {
        styleOverrides: {
            root: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans,
                letterSpacing: '0.25px',
                textTransform: 'none'
            }
        }
    },
    MuiFab: {
        styleOverrides: {
            // root: {
            //     backgroundColor: grey[50]
            // }
        }
    },
    MuiTab: {
        styleOverrides: {
            root: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans,
                // fontSize: 16,
                letterSpacing: '0.25px',
                textTransform: 'none'
            }
        }
    },
    MuiTypography: {
        styleOverrides: {
            h6: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans
            }
        }
    }
};
