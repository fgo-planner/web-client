import { GameServant, MasterServant, PlanServant, PlanServantOwned, PlanServantType } from '@fgo-planner/types';
import { alpha, Box, Tab, Tabs } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { ChangeEvent, ReactNode, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { ComponentStyleProps, Immutable, ImmutableArray } from '../../../../../../types/internal';
import { PlanServantUtils } from '../../../../../../utils/plan/plan-servant.utils';
import { PlanServantSelectAutocomplete } from '../plan-servant-select-autocomplete.component';
import { PlanServantEditCostumesTabContent } from './plan-servant-edit-costumes-tab-content.component';
import { PlanServantEditEnhancementsTabContent } from './plan-servant-edit-enhancements-tab-content.component';

type Props = {
    masterServants: ImmutableArray<MasterServant>;
    onChange?: (planServant: PlanServant) => void;
    /**
     * The planned servant to edit. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     */
    planServant: PlanServant;
    planServants: ImmutableArray<PlanServant>;
    readonly?: boolean;
    servantSelectDisabled?: boolean;
    showAppendSkills?: boolean;
    unlockedCostumes: Array<number>;
} & Pick<ComponentStyleProps, 'className'>;

type AvailableServant = {
    gameId: number;
    instanceId?: number;
};

type TabId = 'current' | 'target' | 'costumes';

export const StyleClassPrefix = 'PlanServantEdit';

const StyleProps = (theme: Theme) => ({
    pt: 4,
    [`& .${StyleClassPrefix}-tabs-container`]: {
        mx: 4,
        mt: -6
    },
    [`& .${StyleClassPrefix}-tabs-content-container`]: {
        mx: 2,
        px: 4,
        pt: 8,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: alpha(theme.palette.text.primary, 0.23),
        borderRadius: 1
    },
    [`& .${StyleClassPrefix}-input-field-group`]: {
        display: 'flex',
        flexWrap: 'nowrap',
        [theme.breakpoints.down('sm')]: {
            flexWrap: 'wrap'
        },
        [`& .${InputFieldContainerStyleClassPrefix}-root`]: {
            flex: 1,
            px: 2,
            [theme.breakpoints.down('sm')]: {
                flex: '100% !important',
                '&.empty': {
                    display: 'none'
                }
            }
        }
    }
} as SystemStyleObject<Theme>);

export const PlanServantEdit = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const gameServantMap = useGameServantMap();

    const {
        masterServants,
        planServant,
        planServants,
        readonly,
        servantSelectDisabled,
        showAppendSkills,
        className
    } = props;

    /**
     * The servants available for the servant select.
     */
    const [availableServants, setAvailableServants] = useState<ImmutableArray<AvailableServant>>([]);

    const [gameServant, setGameServant] = useState<Immutable<GameServant>>();

    const [activeTab, setActiveTab] = useState<TabId>('target');

    /*
     * Updates the `planServantRef` if the `planServant` prop has changed. If
     * `planServant` is `undefined`, then a new instance is created to ensure that
     * the ref is never `undefined` from this point forward.
     */
    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const gameId = planServant.gameId;
        if (gameServant?._id !== gameId) {
            setGameServant(gameServantMap[gameId]);
        }
    }, [gameServant, gameServantMap, planServant.gameId]);

    /*
     * Updates the list of available servants based on the planned servant's
     * ownership type. Owned servants can only be replaced by other owned servants,
     * while unowned servants can only be replaced by other unowned servants.
     */
    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const { type } = planServant;
        let availableServants;
        if (type === PlanServantType.Owned) {
            availableServants = PlanServantUtils
                .findAvailableOwnedServants(planServants, masterServants);
        } else {
            availableServants = PlanServantUtils
                .findAvailableUnownedServants(planServants, Object.values(gameServantMap))
                .map(servant => ({ gameId: servant._id }));
        }
        setAvailableServants(availableServants);
    }, [gameServantMap, masterServants, planServant, planServants]);

    //#region Input event handlers

    const handleSelectedServantChange = useCallback((event: ChangeEvent<{}>, value: { gameId: number, instanceId?: number }): void => {
        if (!gameServantMap || servantSelectDisabled) {
            return;
        }
        const { gameId, instanceId } = value;
        if (planServant.type === PlanServantType.Owned) {
            const masterServant = masterServants.find(servant => servant.gameId === gameId && servant.instanceId === instanceId);
            if (!masterServant) {
                // TODO Is this case possible?
                return;
            }
            PlanServantUtils.updateEnhancements(planServant.current, masterServant);
            (planServant as PlanServantOwned).instanceId = instanceId!;
        }
        if (planServant.gameId !== gameId) {
            planServant.gameId = gameId;
            setGameServant(gameServantMap[gameId]);
        }
        forceUpdate();
    }, [forceUpdate, gameServantMap, masterServants, planServant, servantSelectDisabled]);

    const handleActiveTabChange = useCallback((event: SyntheticEvent, value: TabId) => {
        setActiveTab(value);
    }, []);

    //#endregion


    //#region Component rendering

    /*
     * These can be undefined during the initial render.
     */
    if (!gameServantMap || !gameServant) {
        return null;
    }

    let tabsContentNode: ReactNode;
    if (activeTab === 'costumes') {
        tabsContentNode = (
            <PlanServantEditCostumesTabContent
                gameServant={gameServant}
                unlockedCostumes={planServant.current.costumes}
            />
        );
    } else {
        tabsContentNode = (
            <PlanServantEditEnhancementsTabContent
                enhancementSet={activeTab}
                planServant={planServant}
                gameServant={gameServant}
                showAppendSkills={showAppendSkills}
                onChange={(e) => console.log(e)}
            />
        );
    }

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, className)} sx={StyleProps} >
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    <PlanServantSelectAutocomplete
                        availableServants={availableServants}
                        selectedGameId={planServant.gameId}
                        selectedInstanceId={(planServant as any).instanceId}
                        type={planServant.type}
                        onChange={handleSelectedServantChange}
                        disabled={readonly || servantSelectDisabled}
                    />
                </InputFieldContainer>
            </div>
            <div className={`${StyleClassPrefix}-tabs-container`}>
                <Tabs value={activeTab} onChange={handleActiveTabChange}>
                    <Tab label='Current' value='current' />
                    <Tab label='Target' value='target' />
                    <Tab label='Costumes' value='costumes' disabled />
                </Tabs>
            </div>
            <div className={`${StyleClassPrefix}-tabs-content-container`}>
                {tabsContentNode}
            </div>
        </Box>
    );

    //#endregion

});
