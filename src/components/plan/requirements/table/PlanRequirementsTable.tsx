import { CollectionUtils, Functions, Immutable } from '@fgo-planner/common-core';
import { GameItemConstants, InstantiatedServantUtils, PlanServantAggregatedData } from '@fgo-planner/data-core';
import { Box } from '@mui/system';
import React, { CSSProperties, MouseEvent, MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useGameItemCategoryMap } from '../../../../hooks/data/use-game-item-category-map.hook';
import { useMultiSelectHelperForMouseEvent } from '../../../../hooks/user-interface/list-select-helper/use-multi-select-helper-for-mouse-event.hook';
import { GameItemCategory, GameItemCategoryMap, PlanRequirements } from '../../../../types';
import { PlanRequirementsTableFooter } from './PlanRequirementsTableFooter';
import { PlanRequirementsTableHeader } from './PlanRequirementsTableHeader';
import { PlanRequirementsTableOptions } from './PlanRequirementsTableOptions.type';
import { PlanRequirementsTableOptionsInternal } from './PlanRequirementsTableOptionsInternal.type';
import { PlanRequirementsTableServantRow } from './PlanRequirementsTableServantRow';
import { PlanRequirementsTableStyle } from './PlanRequirementsTableStyle';

type Props = {
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
    onEditMasterItems?: () => void;
    onRowClick?: MouseEventHandler;
    onRowDoubleClick?: MouseEventHandler;
    onSelectionChange?: (selectedInstanceIds: ReadonlySet<number>) => void;
};

type HoverState = {
    rowIndex?: number;
    itemId?: number;
};

const CellSizeCondensed = 0.8125;
const CellSizeNormal = 1.0;

const getDisplayedItems = (
    gameItemCategoryMap: GameItemCategoryMap,
    planRequirements: Immutable<PlanRequirements>,
    itemDisplayOptions: PlanRequirementsTableOptions['displayItems']
): Array<number> => {
    /** 
     * Build unfiltered list of item IDs based on display options.
     */
    /** */
    let items = [
        ...gameItemCategoryMap[GameItemCategory.BronzeEnhancementMaterials],
        ...gameItemCategoryMap[GameItemCategory.SilverEnhancementMaterials],
        ...gameItemCategoryMap[GameItemCategory.GoldEnhancementMaterials]
    ];
    if (itemDisplayOptions.statues) {
        items.push(...gameItemCategoryMap[GameItemCategory.AscensionStatues]);
    }
    if (itemDisplayOptions.grails) {
        items.push(GameItemConstants.GrailItemId);
    }
    if (itemDisplayOptions.gems) {
        items.push(...gameItemCategoryMap[GameItemCategory.SkillGems]);
    }
    if (itemDisplayOptions.lores) {
        items.push(GameItemConstants.LoreItemId);
    }
    /** 
     * If only required items are displayed, then filter out all the empty
     * (undefined) values.
     */
    if (!itemDisplayOptions.empty) {
        const groupItems = planRequirements.requirements.group.items;
        items = items.filter(itemId => groupItems[itemId] !== undefined);
    }
    /**
     * QP is a special case that needs to be added last.
     */
    if (itemDisplayOptions.qp) {
        items.push(GameItemConstants.QpItemId);
    }
    return items;
};

export const StyleClassPrefix = 'PlanRequirementsTable';

export const PlanRequirementsTable = React.memo((props: Props) => {

    const gameItemCategoryMap = useGameItemCategoryMap();

    const {
        options,
        planRequirements,
        planServantsData,
        selectedInstanceIds = CollectionUtils.emptySet(),
        onEditMasterItems,
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

    const [hoverState, setHoverState] = useState<HoverState>(Functions.emptyObjectSupplier);

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

        const {
            displayZeroValues = false,
            layout: {
                rowHeader: servantRowHeaderMode
            }
        } = options;

        return {
            displayedItems,
            displayZeroValues,
            servantRowHeaderMode
        };
    }, [displayedItems, options]);

    const scalingStyle = useMemo((): CSSProperties => {
        const scale = options.layout.cells === 'condensed' ? CellSizeCondensed : CellSizeNormal;
        return {
            fontSize: `${scale}rem`
        } as CSSProperties;
    }, [options.layout.cells]);


    //#region Input event handlers
    
    const handleRowClick = useCallback((e: MouseEvent, index: number) => {
        handleItemClick(e, index);
        onRowClick?.(e);
    }, [handleItemClick, onRowClick]);

    const handleHover = useCallback((rowIndex?: number, itemId?: number) => {
        setHoverState({
            rowIndex,
            itemId
        });
    }, []);

    const handleTableContainerMouseLeave = useCallback((_event: MouseEvent) => {
        setHoverState({
            rowIndex: undefined,
            itemId: undefined
        });
    }, []);

    //#endregion


    //#region Component rendering

    const servantsRequirements = planRequirements.requirements.servants;

    const renderServantRow = (planServantData: PlanServantAggregatedData, index: number): ReactNode => {
        const instanceId = planServantData.instanceId;
        const servantRequirements = servantsRequirements[instanceId];
        if (!servantRequirements) {
            // TODO Log this
            return null;
        }
        const active = selectedInstanceIds?.has(instanceId);
        const hover = hoverState.rowIndex === index;

        return (
            <PlanRequirementsTableServantRow
                key={instanceId}
                active={active}
                hover={hover}
                hoverItemId={hoverState.itemId}
                borderTop={!!index}
                index={index}
                options={internalTableOptions}
                planServantData={planServantData}
                servantRequirements={servantRequirements}
                onClick={handleRowClick}
                onContextMenu={handleRowClick}
                onDoubleClick={onRowDoubleClick}
                onHover={handleHover}
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={PlanRequirementsTableStyle}>
            <div
                className={`${StyleClassPrefix}-table-container`}
                style={scalingStyle}
                onMouseLeave={handleTableContainerMouseLeave}
            >
                <PlanRequirementsTableHeader
                    hoverItemId={hoverState.itemId}
                    options={internalTableOptions}
                    onHover={handleHover}
                />
                {planServantsData.map(renderServantRow)}
                <PlanRequirementsTableFooter
                    hoverItemId={hoverState.itemId}
                    planRequirements={planRequirements}
                    options={internalTableOptions}
                    onEditMasterItems={onEditMasterItems}
                    onHover={handleHover}
                />
            </div>
        </Box>
    );

    //#endregion

});
