import { MuiStyledOptions, styled } from '@mui/system';

const StyleClassPrefix = 'LayoutPanel';

const StyleOptions = {
    name: StyleClassPrefix,
    slot: 'root'
} as MuiStyledOptions;

export const LayoutPanel = styled('div', StyleOptions)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(4),
    overflow: 'hidden'
}));
