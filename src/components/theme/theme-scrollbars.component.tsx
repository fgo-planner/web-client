import { styled } from '@mui/system';
import { ThemeConstants } from '../../styles/theme-constants';

// This component does not need StyleClassPrefix.

// TODO Move scrollbar styling directly into the ThemeProviderWrapper component.

/**
 * Replaces the default scrollbar styles with the theme based scrollbars for
 * the children nodes.
 * 
 * @deprecated Scrollbar styling will be moved directly into the ThemeProviderWrapper component.
 */
export const ThemeScrollbars = styled('div')(({ theme }) => ({
    '& *::-webkit-scrollbar': {
        width: theme.spacing(ThemeConstants.ScrollbarWidthScale)
    },
    '& *::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.primary.main,
        borderRadius: theme.spacing(ThemeConstants.ScrollbarWidthScale / 2)
    },
    '& .scrollbar-track-border': {
        '& *::-webkit-scrollbar-track': {
            borderLeftWidth: 1,
            borderLeftStyle: 'solid',
            borderLeftColor: theme.palette.divider,
        }
    }
}));