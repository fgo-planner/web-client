import { fade, StyleRules, Theme } from '@material-ui/core';

const style = (theme: Theme) => ({
    row: {
        '&:hover': {
            background: fade(theme.palette.text.primary, 0.07)
        }
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: theme.palette.divider,
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: theme.palette.divider,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftStyle: 'solid',
        borderLeftColor: theme.palette.divider,
    }
} as StyleRules);

export default style;
