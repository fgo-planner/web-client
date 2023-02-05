import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, MouseEventHandler, useCallback, useRef } from 'react';
import { DataTableListHeaderLabel } from '../../../../../../components/data-table-list/DataTableListHeaderLabel';
import { HeaderLabel } from '../../../../../../components/text/HeaderLabel';
import { ThemeConstants } from '../../../../../../styles/ThemeConstants';
import { SortDirection, SortOptions } from '../../../../../../types';
import { MasterServantListColumn } from './MasterServantListColumn';

type Props = {
    dragDropMode?: boolean;
    onClick?: MouseEventHandler;
    onSortChange?: (column?: MasterServantListColumn.Name, direction?: SortDirection) => void;
    sortEnabled?: boolean;
    sortOptions?: SortOptions<MasterServantListColumn.Name>;
    visibleColumns?: Readonly<MasterServantListColumn.Visibility>;
    viewLayout?: any; // TODO Make use of this
};

export const StyleClassPrefix = 'MasterServantListHeader';

const StyleProps = (theme: SystemTheme) => {

    const { palette } = theme as Theme;

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
            '&.drag-drop-mode': {
                pl: 10
            },
            [`& .${StyleClassPrefix}-label`]: {
                display: 'flex',
                justifyContent: 'center',
                minWidth: MasterServantListColumn.Properties.label.width + 52,
                '&>div': {
                    cursor: 'pointer'
                }
            },
            [`& .${StyleClassPrefix}-stats`]: {
                display: 'flex'
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantListHeader = React.memo((props: Props) => {

    const {
        dragDropMode,
        onClick,
        onSortChange,
        sortOptions,
        visibleColumns = {}
    } = props;

    const {
        npLevel,
        level,
        fouHp,
        fouAtk,
        skills,
        appendSkills,
        bondLevel,
        summonDate
    } = visibleColumns || {};

    const sortOptionsRef = useRef<SortOptions<MasterServantListColumn.Name>>();
    sortOptionsRef.current = sortOptions;

    const handleLabelClick = useCallback((e: MouseEvent, column: MasterServantListColumn.Name): void => {
        if (e.type === 'contextmenu' || !onSortChange) {
            return;
        }
        e.stopPropagation();
        const sortOptions = sortOptionsRef.current;
        let direction: SortDirection;
        if (sortOptions?.sort !== column) {
            direction = 'desc';
        } else {
            direction = sortOptions.direction === 'asc' ? 'desc' : 'asc';
        }
        onSortChange(column, direction);
    }, [onSortChange]);

    const resetSort = useCallback((e: MouseEvent): void => {
        onSortChange?.();
    }, [onSortChange]);

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, ThemeConstants.ClassScrollbarHidden)} sx={StyleProps}>
            <div className={clsx(`${StyleClassPrefix}-content`, dragDropMode && 'drag-drop-mode')} onContextMenu={onClick}>
                <div className={`${StyleClassPrefix}-label`}>
                    <HeaderLabel onClick={resetSort}>
                        Servant
                    </HeaderLabel>
                </div>
                {npLevel &&
                    <DataTableListHeaderLabel
                        column='npLevel'
                        columnProperties={MasterServantListColumn.Properties.npLevel}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {level &&
                    <DataTableListHeaderLabel
                        column='level'
                        columnProperties={MasterServantListColumn.Properties.level}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {fouHp &&
                    <DataTableListHeaderLabel
                        column='fouHp'
                        columnProperties={MasterServantListColumn.Properties.fouHp}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {fouAtk &&
                    <DataTableListHeaderLabel
                        column='fouAtk'
                        columnProperties={MasterServantListColumn.Properties.fouAtk}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {skills &&
                    <DataTableListHeaderLabel
                        column='skills'
                        columnProperties={MasterServantListColumn.Properties.skills}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {appendSkills &&
                    <DataTableListHeaderLabel
                        column='appendSkills'
                        columnProperties={MasterServantListColumn.Properties.appendSkills}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {bondLevel &&
                    <DataTableListHeaderLabel
                        column='bondLevel'
                        columnProperties={MasterServantListColumn.Properties.bondLevel}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
                {summonDate &&
                    <DataTableListHeaderLabel
                        column='summonDate'
                        columnProperties={MasterServantListColumn.Properties.summonDate}
                        sortOptions={sortOptions}
                        onClick={handleLabelClick}
                    />
                }
            </div>
        </Box>
    );

});
