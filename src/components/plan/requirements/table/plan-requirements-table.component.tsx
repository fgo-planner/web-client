import { MasterAccount, Plan, PlanServant } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, useMemo } from 'react';
import { GameItemConstants } from '../../../../constants';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { PlanRequirements } from '../../../../types/data';
import { Immutable } from '../../../../types/internal';
import { ArrayUtils } from '../../../../utils/array.utils';
import { PlanRequirementsTableFooter } from './plan-requirements-table-footer.component';
import { PlanRequirementsTableHeader, StyleClassPrefix as PlanRequirementsTableHeaderStyleClassPrefix } from './plan-requirements-table-header.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableOptions } from './plan-requirements-table-options.type';
import { PlanRequirementsTableServantRow } from './plan-requirements-table-servant-row.component';

type Props = {
    masterAccount: Immutable<MasterAccount>;
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
    planRequirements: Immutable<PlanRequirements>,
    itemDisplayOptions: PlanRequirementsTableOptions['displayItems']
): Array<number> => {
    /*
     * Build default list of item IDs based on display options.
     */
    const defaultItems = [
        ...GameItemConstants.BronzeEnhancementMaterials,
        ...GameItemConstants.SilverEnhancementMaterials,
        ...GameItemConstants.GoldEnhancementMaterials
    ];
    if (itemDisplayOptions.statues) {
        defaultItems.push(...GameItemConstants.AscensionStatues);
    }
    if (itemDisplayOptions.grails) {
        defaultItems.push(7999); // TODO Un-hardcode this
    }
    if (itemDisplayOptions.gems) {
        defaultItems.push(...GameItemConstants.SkillGems);
    }
    if (itemDisplayOptions.lores) {
        defaultItems.push(6999); // TODO Un-hardcode this
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

    const {
        masterAccount,
        onEditServant,
        onDeleteServant,
        options,
        plan,
        planRequirements
    } = props;

    const masterServantMap = useMemo(() => {
        return ArrayUtils.mapArrayToObject(masterAccount.servants, servant => servant.instanceId);
    }, [masterAccount]);

    const displayedItems = useMemo((): Array<number> => {
        return getDisplayedItems(planRequirements, options.displayItems);
    }, [planRequirements, options.displayItems]);

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
                    planRequirements={planRequirements}
                    options={internalTableOptions}
                />
            </div>
        </Box>
    );

    //#endregion

});
