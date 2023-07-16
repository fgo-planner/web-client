import { Box, Icon } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import clsx from 'clsx';
import React, { CSSProperties, MouseEvent, MouseEventHandler, ReactNode, useMemo } from 'react';
import { DataTableListColumnProperties, SortOptions } from '../../types';
import { HeaderLabel } from '../text/HeaderLabel';

type Props<T extends string> = {
    column: T;
    columnProperties: DataTableListColumnProperties;
    onClick?: (e: MouseEvent, column: T) => void;
    sortOptions?: SortOptions<T>;
};

export const StyleClassPrefix = 'DataTableListHeaderLabel';

const StyleProps = () => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&>div': {
        display: 'flex',
        '& .MuiIcon-root': {
            ml: 2,
            fontSize: '1.25rem'
        }
    },
    '&.sortable': {
        '&>div': {
            cursor: 'pointer'
        }
    }
} as SystemStyleObject);

export const DataTableListHeaderLabel = React.memo(<T extends string>(props: Props<T>) => {

    const {
        column,
        columnProperties: {
            label,
            width,
            sortable
        },
        onClick,
        sortOptions
    } = props;

    const handleClick = useMemo((): MouseEventHandler | undefined => {
        if (!sortable || !onClick) {
            return undefined;
        }
        return (e: MouseEvent): void => {
            onClick(e, column);
        };
    }, [column, onClick, sortable]);

    const sorted = sortable && sortOptions?.sort === column;

    let sortIcon: ReactNode;
    if (!sorted) {
        sortIcon = null;
    } else if (sortOptions.direction === 'asc') {
        sortIcon = <Icon>arrow_upward</Icon>;
    } else {
        sortIcon = <Icon>arrow_downward</Icon>;
    }

    const className = clsx(
        `${StyleClassPrefix}-root`,
        sortable && 'sortable'
    );

    const style: CSSProperties = width ? { width } : { flex: 1 };

    return (
        <Box className={className} style={style} sx={StyleProps}>
            <HeaderLabel onClick={handleClick}>
                {label} {sortIcon}
            </HeaderLabel>
        </Box>
    );

}) as <T extends string> (props: Props<T>) => JSX.Element;
