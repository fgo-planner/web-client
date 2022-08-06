import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Box } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import clsx from 'clsx';
import React, { CSSProperties, MouseEvent, MouseEventHandler, ReactNode, useMemo } from 'react';
import { SortOptions } from '../../types/data';
import { ColumnProperties } from '../../types/internal';
import { HeaderLabel } from '../text/header-label.component';

type Props<T extends string> = {
    column: T;
    columnProperties: ColumnProperties;
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
        '& .MuiSvgIcon-root': {
            ml: 2
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
        sortOptions,
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
        sortIcon = <ArrowUpward fontSize='small' />;
    } else {
        sortIcon = <ArrowDownward fontSize='small' />;
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
