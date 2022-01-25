import { MasterAccount, Plan, PlanServant } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, UIEvent, useCallback, useEffect, useMemo, useRef } from 'react';
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

/**
 * Updates the width of the vertical scroll container based on the current with
 * and scroll position of the horizontal scroll container.
 *
 * This allows the vertical scroll container to resize along with the horizontal
 * scroll so that the vertical scroll bar always remains in a visually fixed
 * position on the right side of the containers.
 */
const updateVerticalScrollContainerWidth = (
    horizontalScrollContainer: Element,
    verticalScrollContainer: HTMLDivElement | null,
    maxWidthOverride?: number
): void => {
    if (!verticalScrollContainer) {
        return;
    }
    const {
        scrollLeft,
        clientWidth,
        scrollWidth
    } = horizontalScrollContainer;
    
    const width = Math.min(scrollLeft + clientWidth, maxWidthOverride || scrollWidth);
    verticalScrollContainer.style.width = `${width}px`;
};

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
        width: 'fit-content'
    },
    [`& .${StyleClassPrefix}-vertical-scroll-container`]: {
        height: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        overflowY: 'auto'
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

    const horizontalScrollContainerRef = useRef<HTMLDivElement>(null);

    const verticalScrollContainerRef = useRef<HTMLDivElement>(null);
    
    const maxWidthElementRef = useRef<HTMLDivElement>(null);

    //#endregion

    /*
     * Binds an observer to update the vertical scroll container width when the
     * horizontal scroll container is resized.
     */
    useEffect(() => {
        /**
         * Observes resize events in the horizontal scroll container and max width
         * reference element and calls the function to update the width of the vertical
         * scroll container accordingly.
         */
        const resizeObserver = new ResizeObserver((entries: Array<ResizeObserverEntry>) => {
            const [horizontalScrollContainer, maxWidthElement] = entries;
            if (!horizontalScrollContainer) {
                return;
            }
            updateVerticalScrollContainerWidth(
                horizontalScrollContainer.target, 
                verticalScrollContainerRef.current,
                maxWidthElement?.target.clientWidth,
            );
        });

        if (horizontalScrollContainerRef.current) {
            /*
             * Observe the horizontal scroll container for resize events. This should allow
             * the width of the vertical scroll container to be updated accordingly when the
             * window is resized or zoomed, or when the info panel visibility is toggled.
             */
            resizeObserver.observe(horizontalScrollContainerRef.current);
            /*
             * Also observe the max width reference element, if it exists.
             */
            if (maxWidthElementRef.current) {
                resizeObserver.observe(maxWidthElementRef.current);
            }
        }

        /*
         * Return a function to clear all observations when the hook is re-triggered or
         * when the component is destroyed.
         */
        return () => resizeObserver.disconnect();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [horizontalScrollContainerRef.current, maxWidthElementRef.current]);

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
        updateVerticalScrollContainerWidth(event.target as Element, verticalScrollContainerRef.current);
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
                borderTop={!!index}
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
            <div
                ref={horizontalScrollContainerRef}
                className={`${StyleClassPrefix}-horizontal-scroll-container`}
                onScroll={handleScroll}
            >
                <div className={`${StyleClassPrefix}-header`} ref={maxWidthElementRef}>
                    <PlanRequirementsTableItemsRow options={internalTableOptions} borderBottom />
                </div>
                <div
                    ref={verticalScrollContainerRef}
                    className={`${StyleClassPrefix}-vertical-scroll-container`}
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
