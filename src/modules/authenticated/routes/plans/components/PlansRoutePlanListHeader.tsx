import { ReadonlyPartial } from '@fgo-planner/common-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, MouseEventHandler, useCallback, useRef } from 'react';
import { DataTableListHeaderLabel } from '../../../../../components/data-table-list/data-table-list-header-label.component';
import { ThemeConstants } from '../../../../../styles/theme-constants';
import { SortDirection, SortOptions } from '../../../../../types';
import { PlansRoutePlanListColumn as Column, PlansRoutePlanListColumnProperties as ColumnProperties, PlansRoutePlanListVisibleColumns as VisibleColumns } from './PlansRoutePlanListColumn.type';

type Props = {
    onClick?: MouseEventHandler;
    onSortChange?: (column?: Column, direction?: SortDirection) => void;
    sortEnabled?: boolean;
    sortOptions?: SortOptions<Column>;
    visibleColumns: ReadonlyPartial<VisibleColumns>;
    viewLayout?: any; // TODO Make use of this
};

export const StyleClassPrefix = 'PlansRoutePlanListHeader';

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
            pl: 3,
            py: 4,
            [breakpoints.down('sm')]: {
                justifyContent: 'flex-start',
                pl: 4,
                '>div': {
                    width: 'initial !important'
                }
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const PlansRoutePlanListHeader = React.memo((props: Props) => {

    const {
        onClick,
        onSortChange,
        sortOptions,
        visibleColumns = {}
    } = props;

    const {
        name,
        description,
        created,
        modified
    } = visibleColumns || {};

    const sortOptionsRef = useRef<SortOptions<Column>>();
    sortOptionsRef.current = sortOptions;

    const handleLabelClick = useCallback((e: MouseEvent, column: Column): void => {
        if (e.type === 'contextmenu' || !onSortChange) {
            return;
        }
        e.stopPropagation();
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
                        columnProperties={ColumnProperties.name}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {created &&
                    <DataTableListHeaderLabel
                        column='created'
                        columnProperties={ColumnProperties.created}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {modified &&
                    <DataTableListHeaderLabel
                        column='modified'
                        columnProperties={ColumnProperties.modified}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {description &&
                    <DataTableListHeaderLabel
                        column='description'
                        columnProperties={ColumnProperties.description}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
            </div>
        </Box>
    );

});
