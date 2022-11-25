import { SxProps, Theme } from '@mui/system';
import { CSSProperties } from 'react';

export type ComponentStyleProps = {
    className?: string;
    style?: CSSProperties;
    sx?: SxProps<Theme>;
};
