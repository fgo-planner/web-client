import { BreakpointsOptions } from '@mui/material/styles';

/**
 * Breakpoint definitions that are used throughout the app.
 */
export const BreakpointOverrides: BreakpointsOptions = {
    values: {
        // These are all default values except for the `xl` breakpoint.
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1600 // Default value was 1920px
    }
};
