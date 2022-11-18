import { CollectionUtils, Immutable } from '@fgo-planner/common-core';
import { GameItemConstants, ImmutableMasterAccount, Plan, PlanServant } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, useMemo } from 'react';
import { useGameItemCategoryMap } from '../../../../hooks/data/use-game-item-category-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { GameItemCategory, GameItemCategoryMap, PlanRequirements } from '../../../../types';
import { PlanRequirementsTableFooter } from './plan-requirements-table-footer.component';
import { PlanRequirementsTableHeader, StyleClassPrefix as PlanRequirementsTableHeaderStyleClassPrefix } from './plan-requirements-table-header.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableOptions } from './plan-requirements-table-options.type';
import { PlanRequirementsTableServantRow } from './plan-requirements-table-servant-row.component';

type Props = {
    masterAccount: ImmutableMasterAccount;
    /**
     * @deprecated Remove edit button from servant row
     */
    onEditServant?: (planServant: Immutable<PlanServant>) => void;
    /**
     * @deprecated Remove delete button from servant row
     */
    onDeleteServant?: (planServant: Immutable<PlanServant>) => void;
    options: PlanRequirementsTableOptions;
    plan: Plan;
    planRequirements: PlanRequirements;
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
    /*
     * If unused items are being displayed, then just return the default item IDs.
     */
    if (itemDisplayOptions.unused) {
        return defaultItems;
    }
    /*
     * The overall group requirements should contain all the items required.
     */
    const groupItems = planRequirements.group.items;
    return defaultItems.filter(itemId => groupItems[itemId] !== undefined);
};

export const StyleClassPrefix = 'PlanRequirementsTable';

const StyleProps = () => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'auto',
    [`& .${StyleClassPrefix}-table-container`]: {
        height: '100%',
        overflow: 'auto',
        /**
         * PlanRequirementsTableHeader component
         */
        [`& .${PlanRequirementsTableHeaderStyleClassPrefix}-root`]: {
            position: 'sticky',
            top: 0,
            zIndex: 3
        }
    }
} as SystemStyleObject<SystemTheme>);

export const PlanRequirementsTable = React.memo((props: Props) => {

    const gameServantMap = useGameServantMap();

    const gameItemCategoryMap = useGameItemCategoryMap();

    const {
        masterAccount,
        onEditServant,
        onDeleteServant,
        options,
        plan,
        planRequirements
    } = props;

    const masterServantMap = useMemo(() => {
        return CollectionUtils.mapIterableToObject(masterAccount.servants, servant => servant.instanceId);
    }, [masterAccount]);

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

    const planServants = plan.servants;

    //#region Component rendering

    /**
     * This can be undefined during the initial render.
     */
    if (!gameServantMap) {
        return null;
    }

    const renderServantRow = (planServant: Immutable<PlanServant>, index: number): ReactNode => {
        const { instanceId } = planServant;
        const masterServant = masterServantMap[instanceId];
        const servantRequirements = planRequirements.servants[instanceId];
        if (!masterServant || !servantRequirements) {
            // TODO Log this
            return null;
        }
        const { gameId } = masterServant;
        const gameServant = gameServantMap[gameId];
        // const active = selectedServants?.has(instanceId);

        return (
            <PlanRequirementsTableServantRow
                key={instanceId}
                // index={index}
                borderTop={!!index}
                gameServant={gameServant}
                masterServant={masterServant}
                planServant={planServant}
                servantRequirements={servantRequirements}
                options={internalTableOptions}
                onEditServant={onEditServant}
                onDeleteServant={onDeleteServant}
                // TODO Add right click (context) handler
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-table-container`}>
                <PlanRequirementsTableHeader
                    options={internalTableOptions}
                />
                {planServants.map(renderServantRow)}
                <PlanRequirementsTableFooter
                    masterAccount={masterAccount}
                    planRequirements={planRequirements}
                    options={internalTableOptions}
                />
            </div>
        </Box>
    );

    //#endregion

});
