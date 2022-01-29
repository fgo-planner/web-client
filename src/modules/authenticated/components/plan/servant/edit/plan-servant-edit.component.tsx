import { GameServant, MasterServant, PlanServant } from '@fgo-planner/types';
import { alpha, Box, Tab, Tabs } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { ChangeEvent, ReactNode, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
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
    unlockedCostumes: ReadonlyArray<number>;
} & Pick<ComponentStyleProps, 'className'>;

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
    const [availableServants, setAvailableServants] = useState<ImmutableArray<MasterServant>>([]);

    const [gameServant, setGameServant] = useState<Immutable<GameServant>>();
    const [masterServant, setMasterServant] = useState<Immutable<MasterServant>>();

    const [activeTab, setActiveTab] = useState<TabId>('target');

    /*
     * Updates the `gameServant` and `masterServant` states when there are changes
     * to the `planServant` and/or `masterServants` props.
     */
    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const instanceId = planServant.instanceId;
        const masterServant = masterServants.find(servant => servant.instanceId === instanceId);
        if (!masterServant) {
            console.error(`masterServant instanceId=[${instanceId}] could not be found`);
            return;
        }
        setMasterServant(masterServant);
        if (gameServant?._id !== masterServant.gameId) {
            setGameServant(gameServantMap[masterServant.gameId]);
        }
    }, [gameServant, gameServantMap, masterServants, planServant.instanceId]);

    /*
     * Updates the `availableServants` state when there are changes to the
     * `planServants` and/or `masterServants` props.
     */
    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const availableServants = PlanServantUtils.findAvailableServants(planServants, masterServants);
        setAvailableServants(availableServants);
    }, [gameServantMap, masterServants, planServants]);

    
    //#region Input event handlers

    const handleSelectedServantChange = useCallback((event: ChangeEvent<{}>, value: Immutable<MasterServant>): void => {
        if (!gameServantMap || servantSelectDisabled) {
            return;
        }
        const { gameId, instanceId } = value;
        PlanServantUtils.updateEnhancements(planServant.current, value);
        planServant.instanceId = instanceId;
        setMasterServant(value);
        if (gameServant?._id !== gameId) {
            setGameServant(gameServantMap[gameId]);
        }
        // TODO Is force update needed?
    }, [gameServant?._id, gameServantMap, planServant, servantSelectDisabled]);

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
                        selectedServant={masterServant}
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
