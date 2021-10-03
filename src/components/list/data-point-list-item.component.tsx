import { Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { CSSProperties, useMemo } from 'react';
import { ComponentStyleProps } from '../../types/internal';

type Props = {
    label: JSX.Element | string | number;
    value: JSX.Element | string | number;
    labelWidth?: string | number;
} & ComponentStyleProps;

const DefaultLabelWidth = '50%';

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        height: 32,
        fontSize: '0.875rem'
    },
    label: {
        color: theme.palette.text.secondary
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'DataPointListItem'
};

const useStyles = makeStyles(style, styleOptions);

export const DataPointListItem = React.memo((props: Props) => {

    const {
        label,
        value,
        labelWidth,
        className,
        style
    } = props;

    const classes = useStyles();

    const labelStyle = useMemo((): CSSProperties => (
        { width: labelWidth || DefaultLabelWidth }
    ), [labelWidth]);

    return (
        <div className={clsx(classes.root, className)} style={style}>
            <div className={clsx(classes.label, 'truncate')} style={labelStyle}>
                {label}
            </div>
            <div className={clsx(classes.value, 'truncate')}>
                {value}
            </div>
        </div>
    );

});