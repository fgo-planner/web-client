import { grey } from '@mui/material/colors';
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
    MuiTypography: {
        styleOverrides: {
            h6: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans
            }
        }
    }
};