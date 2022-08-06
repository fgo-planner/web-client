import { Theme } from '@mui/material';
import { CSSProperties } from '@mui/styles';
import { alpha, Theme as SystemTheme } from '@mui/system';

// TODO Add class for pointer cursor.
const StyleProps = (props: { theme: SystemTheme }) => {

    const {
        palette
    } = props.theme as Theme;

    return {
        '&.row': {
            '&:hover': {
                backgroundColor: alpha(palette.text.primary, 0.07)
            }
        },
        '&.active': {
            backgroundColor: `${alpha(palette.primary.main, 0.07)} !important`,
            '&:hover': {
                backgroundColor: `${alpha(palette.primary.main, 0.12)} !important`,
            }
        },
        '&.border-top': {
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: palette.divider,
        },
        '&.border-bottom': {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider,
        },
        '& .sticky-content': {
            backgroundColor: palette.background.paper,
            position: 'sticky',
            left: 0,
            zIndex: 1  // 1 should be enough for now
        }
    } as CSSProperties;
};

export default StyleProps;
