import { SystemStyleObject, Theme } from '@mui/system';
import { ThemeConstants } from './theme-constants';

/**
 * Replaces the default scrollbar styles with the theme based scrollbars for
 * the children nodes.
 */
export const ScrollbarStyleProps = (({ palette, spacing }: Theme) => ({
    '& *::-webkit-scrollbar': {
        width: spacing(ThemeConstants.ScrollbarWidthScale),
        height: spacing(ThemeConstants.ScrollbarWidthScale)
    },
    '& *::-webkit-scrollbar-corner': {
        backgroundColor: palette.background.paper,
    },
    '& *::-webkit-scrollbar-thumb': {
        backgroundColor: palette.primary.main,
        borderRadius: spacing(ThemeConstants.ScrollbarWidthScale / 2)
    },
    [`& .${ThemeConstants.ClassScrollbarTrackBorder}`]: {
        '& *::-webkit-scrollbar-track': {
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: palette.divider,
            borderLeftWidth: 1,
            borderLeftStyle: 'solid',
            borderLeftColor: palette.divider,
        }
    },
    [`& .${ThemeConstants.ClassScrollbarHidden}`]: {
        '&::-webkit-scrollbar': {
            display: 'none'
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
    }
} as SystemStyleObject<Theme>));
