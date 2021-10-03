import { alpha, Theme } from '@mui/material';

import { StyleRules } from '@mui/styles';

const style = (theme: Theme) => ({
    row: {
        '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.07)
        }
    },
    active: {
        backgroundColor: `${alpha(theme.palette.primary.main, 0.07)} !important`,
        '&:hover': {
            backgroundColor: `${alpha(theme.palette.primary.main, 0.12)} !important`,
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
