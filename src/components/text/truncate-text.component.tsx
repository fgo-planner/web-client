import { CSSInterpolation, MuiStyledOptions, styled } from '@mui/system';

// This component does not need StyleClassPrefix.

const StyleOptions = {
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions;

export const TruncateText = styled('div', StyleOptions)({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
} as CSSInterpolation);
