import { CSSProperties } from '@mui/styled-engine';
import { alpha, Theme } from '@mui/system';

// TODO Add class for pointer cursor.
const style = (theme: Theme) => ({
    '&.row': {
        '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.07)
        }
    },
    '&.active': {
        backgroundColor: `${alpha(theme.palette.primary.main, 0.07)} !important`,
        '&:hover': {
            backgroundColor: `${alpha(theme.palette.primary.main, 0.12)} !important`,
        }
    },
    '&.border-top': {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: theme.palette.divider,
    },
    '&.border-bottom': {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
    }
} as CSSProperties);

export default style;
