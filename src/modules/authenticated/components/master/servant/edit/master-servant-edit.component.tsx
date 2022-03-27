import { GameServant, MasterServantBondLevel } from '@fgo-planner/types';
import { alpha, Box, Tab, Tabs } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { Immutable, ReadonlyRecord } from '../../../../../../types/internal';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { MasterServantSelectAutocomplete } from '../master-servant-select-autocomplete.component';
import { MasterServantEditCostumesTabContent } from './master-servant-edit-costumes-tab-content.component';
import { MasterServantEditData } from './master-servant-edit-data.type';
import { MasterServantEditEnhancementsTabContent } from './master-servant-edit-enhancements-tab-content.component';
import { MasterServantEditGeneralTabContent } from './master-servant-edit-general-tab-content.component';

type Props = {
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>;
    /**
     * The servant data to edit. This will be modified directly, so provide a clone
     * if modification to the original object is not desired.
     */
    editData: MasterServantEditData;
    /**
     * Whether multiple servants are being edited. In this mode, various parameters
     * will not be available for edit.
     */
    multiEditMode?: boolean;
    readonly?: boolean;
    showAppendSkills?: boolean;
};

type TabId = 'general' | 'enhancements' | 'costumes';

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
        bondLevels,
        editData,
        multiEditMode,
        readonly,
        showAppendSkills
    } = props;

    const {
        isNewServant,
        masterServant
    } = editData;

    const servantSelectDisabled = readonly || multiEditMode || !isNewServant;

    const [gameServant, setGameServant] = useState<Immutable<GameServant>>();

    const [activeTab, setActiveTab] = useState<TabId>(isNewServant ? 'general' : 'enhancements');

    /*
     * Updates the `gameServant` state when there are changes to the target
     * servant's `gameId`.
     */
    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const gameId = masterServant.gameId;
        console.log(gameId);
        if (gameId === -1) {
            setGameServant(undefined);
        } else {
            setGameServant(gameServantMap[gameId]);
        }
        // TODO Recompute level/ascension values?
    }, [gameServantMap, masterServant.gameId]);

    //#region Input event handlers

    const handleSelectedServantChange = useCallback((value: Immutable<GameServant>): void => {
        if (!gameServantMap || servantSelectDisabled) {
            return;
        }
        const { _id: gameId } = value;
        if (masterServant.gameId === gameId) {
            return;
        }
        const gameServant = gameServantMap[gameId];
        masterServant.gameId = gameId;
        /*
         * Recompute level/ascension values in case the servant rarity has changed.
         */
        const { ascension, level } = masterServant;
        masterServant.level = MasterServantUtils.roundToNearestValidLevel(ascension, level, gameServant);
        /*
         * Also update the bond level.
         */
        editData.bondLevel = bondLevels[gameId];

        setGameServant(gameServant);
    }, [bondLevels, editData, gameServantMap, masterServant, servantSelectDisabled]);

    const handleActiveTabChange = useCallback((_: SyntheticEvent, value: TabId) => {
        setActiveTab(value);
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
                editData={editData}
                gameServant={gameServant}
                onChange={e => console.log(e)}
            />
        );
    } else if (activeTab === 'enhancements') {
        tabsContentNode = (
            <MasterServantEditEnhancementsTabContent
                editData={editData}
                gameServant={gameServant}
                multiEditMode={multiEditMode}
                showAppendSkills={showAppendSkills}
                onChange={e => console.log(e)}
            />
        );
    } else {
        tabsContentNode = (
            <MasterServantEditGeneralTabContent
                editData={editData}
                gameServant={gameServant}
                multiEditMode={multiEditMode}
                showAppendSkills={showAppendSkills}
                onChange={e => console.log(e)}
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
