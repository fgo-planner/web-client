import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Box } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, MouseEventHandler, ReactNode, useMemo } from 'react';
import { HeaderLabel } from '../../../../../../components/text/header-label.component';
import { SortOptions } from '../../../../../../types/data';
import { MasterServantColumnProperties, MasterServantListColumn } from './master-servant-list-columns';

type Props = {
    column: MasterServantListColumn;
    onClick?: (e: MouseEvent, column: MasterServantListColumn) => void;
    sortOptions?: SortOptions<MasterServantListColumn>;
};

export const StyleClassPrefix = 'MasterServantListHeaderLabel';

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

// TODO Turn this into generic component
export const MasterServantListHeaderLabel = React.memo((props: Props) => {

    const {
        column,
        onClick,
        sortOptions,
    } = props;

    const {
        label,
        width,
        sortable
    } = MasterServantColumnProperties[column];

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

    return (
        <Box className={className} style={{ width }} sx={StyleProps}>
            <HeaderLabel onClick={handleClick}>
                {label} {sortIcon}
            </HeaderLabel>
        </Box>
    );

});
