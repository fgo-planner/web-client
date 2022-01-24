import { MasterAccount, Plan, PlanServant } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, UIEvent, useCallback, useMemo, useRef } from 'react';
import { GameItemConstants } from '../../../../constants';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { PlanRequirements } from '../../../../types/data';
import { Immutable } from '../../../../types/internal';
import { ArrayUtils } from '../../../../utils/array.utils';
import { PlanRequirementsTableItemsRow } from './plan-requirements-table-items-row.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableOptions } from './plan-requirements-table-options.type';
import { PlanRequirementsTableServantRow } from './plan-requirements-table-servant-row.component';
import { PlanRequirementsTableTotalRow } from './plan-requirements-table-total-row.component';

type Props = {
    masterAccount: Immutable<MasterAccount>;
    onEditServant?: (planServant: Immutable<PlanServant>) => void;
    options: PlanRequirementsTableOptions;
    plan: Plan;
    planRequirements: PlanRequirements;
};

const CondensedSize = 42;
const NormalSize = 52;

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

const StyleClassPrefix = 'PlanRequirementsTable';

const StyleProps = {
    display: 'flex',
    position: 'relative',
    maxHeight: '100%',
    maxWidth: '100%',
    [`& .${StyleClassPrefix}-horizontal-scroll-container`]: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
        overflowY: 'clip'
    },
    [`& .${StyleClassPrefix}-header`]: {
        // position: 'absolute'
    },
    [`& .${StyleClassPrefix}-vertical-scroll-container`]: {
        height: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        overflowY: 'auto',
        // pt: '52px',
        // pb: 'calc( 2 * 52px)',
        // '&>div': {
        //     height: '100%',
        //     overflowX: 'hidden',
        //     overflowY: 'auto',
        // }
    },
    [`& .${StyleClassPrefix}-footer`]: {
        // position: 'absolute'
    },
} as SystemStyleObject<Theme>;

export const PlanRequirementsTable = React.memo((props: Props) => {

    const gameServantMap = useGameServantMap();

    const {
        masterAccount,
        onEditServant,
        options,
        plan,
        planRequirements
    } = props;


    //#region Element refs

    const verticalScrollContainerRef = useRef<HTMLDivElement>(null);

    //#endregion


    const masterServantMap = useMemo(() => {
        return ArrayUtils.mapArrayToObject(masterAccount.servants, servant => servant.instanceId);
    }, [masterAccount]);

    const displayedItems = useMemo((): Array<number> => {
        return getDisplayedItems(planRequirements, options.displayItems);
    }, [planRequirements, options.displayItems]);

    const displaySize = options.layout === 'condensed' ? CondensedSize : NormalSize;

    const internalTableOptions = useMemo((): PlanRequirementsTableOptionsInternal => {
        return {
            displaySize,
            displayedItems
        };
    }, [displaySize, displayedItems]);

    const planServants = plan.servants;


    //#region Input event handlers

    const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
        const { scrollLeft, clientWidth } = event.target as Element;
        if (!verticalScrollContainerRef.current) {
            return;
        }
        const containerWidth = scrollLeft + clientWidth;
        verticalScrollContainerRef.current.style.width = `${containerWidth}px`;
    }, []);

    //#endregion


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
                gameServant={gameServant}
                masterServant={masterServant}
                planServant={planServant}
                servantRequirements={servantRequirements}
                options={internalTableOptions}
                onEditServant={onEditServant}
            // TODO Add right click (context) handler
            />
        );
    };

    return (
        <Box sx={StyleProps}>
            <div className={`${StyleClassPrefix}-horizontal-scroll-container`} onScroll={handleScroll}>
                <div className={`${StyleClassPrefix}-header`}>
                    <PlanRequirementsTableItemsRow options={internalTableOptions} />
                </div>
                <div
                    className={`${StyleClassPrefix}-vertical-scroll-container`}
                    ref={verticalScrollContainerRef}
                >
                    {planServants.map(renderServantRow)}
                </div>
                <div className={`${StyleClassPrefix}-footer`}>
                    <PlanRequirementsTableTotalRow
                        requirements={planRequirements.group}
                        options={internalTableOptions}
                    />
                    <PlanRequirementsTableItemsRow options={internalTableOptions} />
                </div>
            </div>
        </Box>
    );

    //#endregion

});
