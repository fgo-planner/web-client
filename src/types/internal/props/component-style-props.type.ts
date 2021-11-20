import { ClassNameMap } from '@mui/styles';
import { SxProps, Theme } from '@mui/system';
import { CSSProperties } from 'react';

export type ComponentStyleProps = {
    className?: string;
    /**
     * @deprecated
     */
    classes?: ClassNameMap;
    style?: CSSProperties;
    sx?: SxProps<Theme>;
};
