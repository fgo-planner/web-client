import { GameServant, MasterServantBondLevel } from '@fgo-planner/types';
import { alpha, Box, Tab, Tabs } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { Immutable, MasterServantUpdate, ReadonlyRecord, MasterServantUpdateIndeterminateValue as IndeterminateValue } from '../../../../../../types/internal';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { MasterServantSelectAutocomplete } from '../master-servant-select-autocomplete.component';
import { MasterServantEditCostumesTabContent } from './master-servant-edit-costumes-tab-content.component';
import { MasterServantEditEnhancementsTabContent } from './master-servant-edit-enhancements-tab-content.component';
import { MasterServantEditGeneralTabContent } from './master-servant-edit-general-tab-content.component';

export type MasterServantEditTab = 'general' | 'enhancements' | 'costumes';

type Props = {
    activeTab: MasterServantEditTab;
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>;
    /**
     * The update payload for editing. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     */
    masterServantUpdate: MasterServantUpdate;
    /**
     * Whether multiple servants are being edited. In this mode, various parameters
     * will not be available for edit.
     */
    multiEditMode?: boolean;
    onTabChange: (tab: MasterServantEditTab) => void;
    readonly?: boolean;
    showAppendSkills?: boolean;
};

const DefaultTab = 'general';

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

export const MasterServantEdit = React.memo((props: Props) => {

    const gameServantMap = useGameServantMap();

    const {
        activeTab = DefaultTab,
        bondLevels,
        masterServantUpdate,
        multiEditMode,
        onTabChange,
        readonly,
        showAppendSkills
    } = props;

    const { isNewServant } = masterServantUpdate;

    const servantSelectDisabled = readonly || multiEditMode || !isNewServant;

    const [gameServant, setGameServant] = useState<Immutable<GameServant>>();

    /**
     * Updates the `gameServant` state when there are changes to the target
     * servant's `gameId`.
     */
    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const gameId = masterServantUpdate.gameId;
        if (gameId === IndeterminateValue) {
            setGameServant(undefined);
        } else {
            setGameServant(gameServantMap[gameId]);
        }
        // TODO Recompute level/ascension values?
    }, [gameServantMap, masterServantUpdate.gameId]);

    //#region Input event handlers

    const handleSelectedServantChange = useCallback((value: Immutable<GameServant>): void => {
        if (!gameServantMap || servantSelectDisabled) {
            return;
        }
        const { _id: gameId } = value;
        if (masterServantUpdate.gameId === gameId) {
            return;
        }
        const gameServant = gameServantMap[gameId];
        masterServantUpdate.gameId = gameId;
        /*
         * Recompute level/ascension values in case the servant rarity has changed.
         */
        const { ascension, level } = masterServantUpdate;
        if (level !== IndeterminateValue && ascension !== IndeterminateValue) {
            masterServantUpdate.level = MasterServantUtils.roundToNearestValidLevel(ascension, level, gameServant);
        }
        /*
         * Also update the bond level.
         */
        masterServantUpdate.bondLevel = bondLevels[gameId];

        setGameServant(gameServant);
    }, [bondLevels, gameServantMap, servantSelectDisabled, masterServantUpdate]);

    const handleActiveTabChange = useCallback((_: SyntheticEvent, value: MasterServantEditTab) => {
        onTabChange(value);
    }, [onTabChange]);

    //#endregion
    

    //#region Other event handlers
    
    const handleUpdateChange = useCallback((update: MasterServantUpdate): void => {
        // TODO Do something with this.
        console.log(update);
    }, []);
    
    //#endregion


    //#region Component rendering

    /*
     * These can be undefined during the initial render.
     */
    if (!gameServantMap || (!multiEditMode && !gameServant)) {
        return null;
    }

    let tabsContentNode: ReactNode;
    if (activeTab === 'costumes') {
        tabsContentNode = (
            <MasterServantEditCostumesTabContent
                masterServantUpdate={masterServantUpdate}
                gameServant={gameServant}
                onChange={handleUpdateChange}
            />
        );
    } else if (activeTab === 'enhancements') {
        tabsContentNode = (
            <MasterServantEditEnhancementsTabContent
                masterServantUpdate={masterServantUpdate}
                gameServant={gameServant}
                multiEditMode={multiEditMode}
                showAppendSkills={showAppendSkills}
                onChange={handleUpdateChange}
            />
        );
    } else {
        tabsContentNode = (
            <MasterServantEditGeneralTabContent
                masterServantUpdate={masterServantUpdate}
                gameServant={gameServant}
                multiEditMode={multiEditMode}
                showAppendSkills={showAppendSkills}
                onChange={handleUpdateChange}
            />
        );
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps} >
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    <MasterServantSelectAutocomplete
                        selectedServant={gameServant}
                        onChange={handleSelectedServantChange}
                        multiEditMode={multiEditMode}
                        disabled={servantSelectDisabled}
                    />
                </InputFieldContainer>
            </div>
            <div className={`${StyleClassPrefix}-tabs-container`}>
                <Tabs value={activeTab} onChange={handleActiveTabChange}>
                    <Tab
                        label='General'
                        value='general'
                    />
                    <Tab
                        label='Enhancements'
                        value='enhancements'
                    />
                    <Tab
                        label='Costumes'
                        value='costumes'
                        disabled={multiEditMode}
                    />
                </Tabs>
            </div>
            <div className={`${StyleClassPrefix}-tabs-content-container`}>
                {tabsContentNode}
            </div>
        </Box>
    );

    //#endregion

});
