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
                letterSpacing: '0.015625rem',
                textTransform: 'none',
                borderRadius: '18.25px'
            },
            contained: {
                boxShadow: 'none !important'
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
    MuiListItemIcon: {
        styleOverrides: {
            root: {
                '& .MuiIcon-root': {
                    fontSize: '1.25rem'
                }
            }
        }
    },
    MuiTab: {
        styleOverrides: {
            root: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans,
                // fontSize: 16,
                letterSpacing: '0.015625rem',
                textTransform: 'none'
            }
        }
    },
    MuiTypography: {
        styleOverrides: {
            h2: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans,
                fontWeight: 500
            },
            h3: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans,
                fontWeight: 500
            },
            h4: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans,
                fontWeight: 500
            },
            h5: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans,
                fontWeight: 500
            },
            h6: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans
            }
        }
    }
};
