import { ReadonlyPartial } from '@fgo-planner/common-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, MouseEventHandler, useCallback, useRef } from 'react';
import { DataTableListHeaderLabel } from '../../../../../components/data-table-list/DataTableListHeaderLabel';
import { ThemeConstants } from '../../../../../styles/ThemeConstants';
import { SortDirection, SortOptions } from '../../../../../types';
import { MasterAccountsRouteAccountListColumn } from './MasterAccountsRouteAccountListColumn';

type Props = {
    onClick?: MouseEventHandler;
    onSortChange?: (column?: MasterAccountsRouteAccountListColumn.Name, direction?: SortDirection) => void;
    sortEnabled?: boolean;
    sortOptions?: SortOptions<MasterAccountsRouteAccountListColumn.Name>;
    visibleColumns: ReadonlyPartial<MasterAccountsRouteAccountListColumn.Visibility>;
    viewLayout?: any; // TODO Make use of this
};

export const StyleClassPrefix = 'MasterAccountsRouteAccountListHeader';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette
    } = theme as Theme;

    return {
        position: 'sticky',
        top: 0,
        width: 'fit-content',
        minWidth: '100%',
        minHeight: 54,
        backgroundColor: palette.background.paper,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        zIndex: 2,  // This needs to be higher than the .sticky-content in the rows
        [`& .${StyleClassPrefix}-content`]: {
            display: 'flex',
            px: 4,
            py: 4,
            [breakpoints.down('sm')]: {
                '&>:first-of-type': {
                    flex: 1,
                    width: 'initial !important',
                    px: 0,
                    justifyContent: 'flex-start'
                },
                justifyContent: 'space-between',
                px: 4
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterAccountsRouteAccountListHeader = React.memo((props: Props) => {

    const {
        onClick,
        onSortChange,
        sortOptions,
        visibleColumns = {}
    } = props;

    const {
        name,
        friendId,
        created,
        modified
    } = visibleColumns || {};

    const sortOptionsRef = useRef<SortOptions<MasterAccountsRouteAccountListColumn.Name>>();
    sortOptionsRef.current = sortOptions;

    const handleLabelClick = useCallback((event: MouseEvent, column: MasterAccountsRouteAccountListColumn.Name): void => {
        if (event.type === 'contextmenu' || !onSortChange) {
            return;
        }
        event.stopPropagation();
        const sortOptions = sortOptionsRef.current;
        let direction: SortDirection;
        if (sortOptions?.sort !== column) {
            direction = 'desc';
        } else if (column === 'name' && sortOptions.direction === 'asc') {
            return onSortChange();  // Reset sort
        } else {
            direction = sortOptions.direction === 'asc' ? 'desc' : 'asc';
        }
        onSortChange(column, direction);
    }, [onSortChange]);

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, ThemeConstants.ClassScrollbarHidden)} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-content`} onContextMenu={onClick}>
                {name &&
                    <DataTableListHeaderLabel
                        column='name'
                        columnProperties={MasterAccountsRouteAccountListColumn.Properties.name}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {friendId &&
                    <DataTableListHeaderLabel
                        column='friendId'
                        columnProperties={MasterAccountsRouteAccountListColumn.Properties.friendId}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {created &&
                    <DataTableListHeaderLabel
                        column='created'
                        columnProperties={MasterAccountsRouteAccountListColumn.Properties.created}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {modified &&
                    <DataTableListHeaderLabel
                        column='modified'
                        columnProperties={MasterAccountsRouteAccountListColumn.Properties.modified}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
            </div>
        </Box>
    );

});
