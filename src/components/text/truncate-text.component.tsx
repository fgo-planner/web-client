import { CSSProperties } from '@mui/styles';
import { styled } from '@mui/system';

// This component does not need StyleClassPrefix.

export const TruncateText = styled('div')(() => ({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
} as CSSProperties));
