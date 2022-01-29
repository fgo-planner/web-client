import { MasterAccount, Plan, PlanServant } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, UIEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { GameItemConstants } from '../../../../constants';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { PlanRequirements } from '../../../../types/data';
import { Immutable } from '../../../../types/internal';
import { ArrayUtils } from '../../../../utils/array.utils';
import { PlanRequirementsTableFooter, StyleClassPrefix as PlanRequirementsTableFooterStyleClassPrefix } from './plan-requirements-table-footer.component';
import { PlanRequirementsTableHeader, StyleClassPrefix as PlanRequirementsTableHeaderStyleClassPrefix } from './plan-requirements-table-header.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableOptions } from './plan-requirements-table-options.type';
import { StyleClassPrefix as PlanRequirementsTabletRowStyleClassPrefix } from './plan-requirements-table-row.component';
import { PlanRequirementsTableServantRow } from './plan-requirements-table-servant-row.component';

type Props = {
    masterAccount: Immutable<MasterAccount>;
    onEditServant?: (planServant: Immutable<PlanServant>) => void;
    options: PlanRequirementsTableOptions;
    plan: Plan;
    planRequirements: PlanRequirements;
};

const CellSizeCondensed = 42;
const CellSizeNormal = 52;

/**
 * Updates the `left` style property of the rows' scroll container elements to
 * follow the horizontal scroll of the table.
 */
const updateRowHorizontalScroll = ({ scrollLeft }: Element): void => {
    const targetClassName = `${PlanRequirementsTabletRowStyleClassPrefix}-scroll-contents`; // TODO Un-hardcode this
    const targetElements = document.getElementsByClassName(targetClassName);
    const left = `${-scrollLeft}px`;
    for (const element of targetElements) {
        (element as HTMLDivElement).style.left = left;
    }
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

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    position: 'relative',
    maxHeight: '100%',
    maxWidth: '100%',
    [`& .${StyleClassPrefix}-horizontal-scroll-container`]: {
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
        overflowY: 'clip'
    },
    [`& .${StyleClassPrefix}-vertical-scroll-container`]: {
        flex: 1,
        height: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'sticky',
        left: 0
    },
    /**
     * PlanRequirementsTableRow component
     */
    [`& .${PlanRequirementsTabletRowStyleClassPrefix}-root`]: {
        display: 'flex',
        width: 'fit-content',
        '&:hover': {
            // backgroundColor: alpha(theme.palette.text.primary, 0.07)
        },
        '&.border-top': {
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: 'divider'
        },
        '&.border-bottom': {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: 'divider'
        },
        '&.not-expandable': {
            cursor: 'default'
        },
        [`& .${PlanRequirementsTabletRowStyleClassPrefix}-sticky-column-container`]: {
            position: 'sticky',
            left: 0,
            borderRightWidth: 1,
            borderRightStyle: 'solid',
            borderRightColor: 'divider'
        },
        [`& .${PlanRequirementsTabletRowStyleClassPrefix}-scroll-container`]: {
            overflow: 'hidden'
        },
        [`& .${PlanRequirementsTabletRowStyleClassPrefix}-scroll-contents`]: {
            display: 'flex',
            position: 'relative'
        },
    },
    /**
     * PlanRequirementsTableHeader component
     */
    [`& .${PlanRequirementsTableHeaderStyleClassPrefix}-root`]: {
        position: 'sticky',
        left: 0
    },
    /**
     * PlanRequirementsTableFooter component
     */
    [`& .${PlanRequirementsTableFooterStyleClassPrefix}-root`]: {
        position: 'sticky',
        left: 0
    }
} as SystemStyleObject<Theme>);

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

    //#endregion

    /*
     * Binds an observer to update the `left` style property of the rows' scroll
     * container elements when horizontal scroll container is resized.
     */
    useEffect(() => {
        /**
         * Observes resize events in the horizontal scroll container and max width
         * reference element and calls the function to update the width of the vertical
         * scroll container accordingly.
         */
        const resizeObserver = new ResizeObserver((entries: Array<ResizeObserverEntry>) => {
            const [horizontalScrollContainer] = entries;
            if (!horizontalScrollContainer) {
                return;
            }
            updateRowHorizontalScroll(horizontalScrollContainer.target);
        });

        /*
         * Observe the horizontal scroll container for resize events.
         */
        if (horizontalScrollContainerRef.current) {
            resizeObserver.observe(horizontalScrollContainerRef.current);
        }

        /*
         * Return a function to clear all observations when the hook is re-triggered or
         * when the component is destroyed.
         */
        return () => resizeObserver.disconnect();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [horizontalScrollContainerRef.current]);

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


    //#region Input event handlers

    const handleHorizontalScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
        updateRowHorizontalScroll(event.target as Element);
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
                borderTop={!index}
                borderBottom
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
                onScroll={handleHorizontalScroll}
            >
                <PlanRequirementsTableHeader
                    options={internalTableOptions}
                />
                <div className={`${StyleClassPrefix}-vertical-scroll-container`}>
                    {planServants.map(renderServantRow)}
                </div>
                <PlanRequirementsTableFooter
                    planRequirements={planRequirements}
                    options={internalTableOptions}
                />
            </div>
        </Box>
    );

    //#endregion

});
