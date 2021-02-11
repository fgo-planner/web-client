import { fade, StyleRules, Theme } from '@material-ui/core';

export default (theme: Theme) => ({
    row: {
        borderTop: `1px solid ${theme.palette.divider}`,
        '&:hover': {
            background: fade(theme.palette.text.primary, 0.07)
        }
    }
} as StyleRules);