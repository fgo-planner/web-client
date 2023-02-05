import { useMediaQuery, useTheme } from '@mui/material';
import { Breakpoint } from '@mui/material/styles';

export type ActiveBreakpoints = Record<Breakpoint, boolean>;

/**
 * Returns a map containing active status of breakpoints.
 */
export const useActiveBreakpoints = (): ActiveBreakpoints => {
    const theme = useTheme();
    const xs = useMediaQuery(theme.breakpoints.up('xs'));
    const sm = useMediaQuery(theme.breakpoints.up('sm'));
    const md = useMediaQuery(theme.breakpoints.up('md'));
    const lg = useMediaQuery(theme.breakpoints.up('lg'));
    const xl = useMediaQuery(theme.breakpoints.up('xl'));

    // return useMemo(() => ({ xs, sm, md, lg, xl }), [xs, sm, md, lg, xl]);

    return { xs, sm, md, lg, xl };
};
