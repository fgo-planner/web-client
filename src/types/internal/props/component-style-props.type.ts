import { ClassNameMap } from '@material-ui/styles';
import { CSSProperties } from 'react';

export type ComponentStyleProps = {
    className?: string;
    classes?: ClassNameMap;
    style?: CSSProperties;
};
