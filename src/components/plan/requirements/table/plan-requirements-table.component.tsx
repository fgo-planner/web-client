import { CollectionUtils, Immutable, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameItemConstants, InstantiatedServantUtils } from '@fgo-planner/data-core';
import { Box } from '@mui/system';
import React, { MouseEvent, MouseEventHandler, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useGameItemCategoryMap } from '../../../../hooks/data/use-game-item-category-map.hook';
import { useMultiSelectHelperForMouseEvent } from '../../../../hooks/user-interface/list-select-helper/use-multi-select-helper-for-mouse-event.hook';
import { GameItemCategory, GameItemCategoryMap, PlanRequirements, PlanServantAggregatedData } from '../../../../types';
import { PlanRequirementsTableFooter } from './plan-requirements-table-footer.component';
import { PlanRequirementsTableHeader } from './plan-requirements-table-header.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableOptions } from './plan-requirements-table-options.type';
import { PlanRequirementsTableServantRow } from './plan-requirements-table-servant-row.component';
import { PlanRequirementsTableStyle } from './plan-requirements-table-style';

type Props = {
    /**
     * The current quantities of items in the master account.
     */
    masterItems: ReadonlyRecord<number, number>;
    options: PlanRequirementsTableOptions;
    /**
     * The computed requirements for the plan.
     */
    planRequirements: PlanRequirements;
    planServantsData: ReadonlyArray<PlanServantAggregatedData>;
    hideEmptyColumns?: boolean;
    /**
     * Instance IDs of selected servants.
     */
    selectedInstanceIds?: ReadonlySet<number>;
    onRowClick?: MouseEventHandler;
    onRowDoubleClick?: MouseEventHandler;
    onSelectionChange?: (selectedInstanceIds: ReadonlySet<number>) => void;
};

const CellSizeCondensed = 42;
const CellSizeNormal = 52;

const getDisplayedItems = (
    gameItemCategoryMap: GameItemCategoryMap,
    planRequirements: Immutable<PlanRequirements>,
    itemDisplayOptions: PlanRequirementsTableOptions['displayItems']
): Array<number> => {
    /** 
     * Build default list of item IDs based on display options.
     */
    /** */
    const defaultItems = [
        ...gameItemCategoryMap[GameItemCategory.BronzeEnhancementMaterials],
        ...gameItemCategoryMap[GameItemCategory.SilverEnhancementMaterials],
        ...gameItemCategoryMap[GameItemCategory.GoldEnhancementMaterials]
    ];
    if (itemDisplayOptions.statues) {
        defaultItems.push(...gameItemCategoryMap[GameItemCategory.AscensionStatues]);
    }
    if (itemDisplayOptions.grails) {
        defaultItems.push(GameItemConstants.GrailItemId);
    }
    if (itemDisplayOptions.gems) {
        defaultItems.push(...gameItemCategoryMap[GameItemCategory.SkillGems]);
    }
    if (itemDisplayOptions.lores) {
        defaultItems.push(GameItemConstants.LoreItemId);
    }
    /** 
     * If empty columns are being displayed, then just return the default item IDs.
     */
    if (itemDisplayOptions.empty) {
        return defaultItems;
    }
    /** 
     * The overall group requirements should contain all the items required.
     */
    const groupItems = planRequirements.group.items;
    return defaultItems.filter(itemId => groupItems[itemId] !== undefined);
};

export const StyleClassPrefix = 'PlanRequirementsTable';

export const PlanRequirementsTable = React.memo((props: Props) => {

    const gameItemCategoryMap = useGameItemCategoryMap();

    const {
        masterItems,
        options,
        planRequirements,
        planServantsData,
        selectedInstanceIds = CollectionUtils.emptySet(),
        onRowClick,
        onRowDoubleClick,
        onSelectionChange
    } = props;

    const {
        selectionResult,
        handleItemClick
    } = useMultiSelectHelperForMouseEvent(
        planServantsData,
        selectedInstanceIds,
        InstantiatedServantUtils.getInstanceId,
        {
            // disabled: dragDropMode,
            rightClickAction: 'contextmenu'
        }
    );

    /**
     * Notify parent component whenever selection has changed.
     */
    useEffect(() => {
        onSelectionChange?.(selectionResult);
    }, [onSelectionChange, selectionResult]);


    const displayedItems = useMemo((): Array<number> => {
        if (!gameItemCategoryMap) {
            return [];
        }
        return getDisplayedItems(
            gameItemCategoryMap,
            planRequirements,
            options.displayItems
        );
    }, [gameItemCategoryMap, planRequirements, options.displayItems]);

    const internalTableOptions = useMemo((): PlanRequirementsTableOptionsInternal => {
        const layout = options.layout;
        return {
            cellSize: layout.cells === 'condensed' ? CellSizeCondensed : CellSizeNormal,
            displayedItems,
            stickyColumnLayout: layout.stickyColumn
        };
    }, [displayedItems, options.layout]);


    //#region Input event handlers
    
    const handleRowClick = useCallback((e: MouseEvent, index: number) => {
        handleItemClick(e, index);
        onRowClick?.(e);
    }, [handleItemClick, onRowClick]);

    //#endregion


    //#region Component rendering

    const renderServantRow = (planServantData: PlanServantAggregatedData, index: number): ReactNode => {
        const instanceId = planServantData.instanceId;
        const servantRequirements = planRequirements.servants[instanceId];
        if (!servantRequirements) {
            // TODO Log this
            return null;
        }
        const active = selectedInstanceIds?.has(instanceId);

        return (
            <PlanRequirementsTableServantRow
                key={instanceId}
                active={active}
                borderTop={!!index}
                index={index}
                options={internalTableOptions}
                planServantData={planServantData}
                servantRequirements={servantRequirements}
                onClick={handleRowClick}
                onContextMenu={handleRowClick}
                onDoubleClick={onRowDoubleClick}
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={PlanRequirementsTableStyle}>
            <div className={`${StyleClassPrefix}-table-container`}>
                <PlanRequirementsTableHeader
                    options={internalTableOptions}
                />
                {planServantsData.map(renderServantRow)}
                <PlanRequirementsTableFooter
                    masterItems={masterItems}
                    planRequirements={planRequirements}
                    options={internalTableOptions}
                />
            </div>
        </Box>
    );

    //#endregion

});
