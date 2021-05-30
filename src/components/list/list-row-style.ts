import { fade, StyleRules, Theme } from '@material-ui/core';

const style = (theme: Theme) => ({
    row: {
        '&:hover': {
            backgroundColor: fade(theme.palette.text.primary, 0.07)
        }
    },
    active: {
        backgroundColor: `${fade(theme.palette.primary.main, 0.07)} !important`,
        '&:hover': {
            backgroundColor: `${fade(theme.palette.primary.main, 0.12)} !important`,
        }
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: theme.palette.divider,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
    }
} as StyleRules);

export default style;
