import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { CSSProperties, useMemo } from 'react';
import { ComponentStyleProps } from '../../types';

type Props = {
    label: JSX.Element | string | number;
    value: JSX.Element | string | number;
    labelWidth?: string | number;
} & Pick<ComponentStyleProps, 'className'>;

const DefaultLabelWidth = '50%';

export const StyleClassPrefix = 'DataPointListItem';

const StyleProps = {
    display: 'flex',
    alignItems: 'center',
    height: 32,
    fontSize: '0.875rem',
    [`& .${StyleClassPrefix}-label`]: {
        color: 'text.secondary'
    } 
} as SystemStyleObject<Theme>;

export const DataPointListItem = React.memo((props: Props) => {

    const {
        label,
        value,
        labelWidth,
        className
    } = props;

    const labelStyle = useMemo((): CSSProperties => ({
        width: labelWidth || DefaultLabelWidth 
    }), [labelWidth]);

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, className)} sx={StyleProps}>
            <div className={clsx(`${StyleClassPrefix}-label`, 'truncate')} style={labelStyle}>
                {label}
            </div>
            <div className='truncate'>
                {value}
            </div>
        </Box>
    );

});
