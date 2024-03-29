import { MuiStyledOptions, styled } from '@mui/system';

const StyleClassPrefix = 'FabContainer';

const StyledOptions = {
    name: StyleClassPrefix,
    slot: 'root'
} as MuiStyledOptions;

export const FabContainer = styled('div', StyledOptions)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-end',
    position: 'fixed',
    bottom: theme.spacing(6),
    right: theme.spacing(8),
    '& >*': {
        marginLeft: theme.spacing(4)
    },
    zIndex: 2
}));
