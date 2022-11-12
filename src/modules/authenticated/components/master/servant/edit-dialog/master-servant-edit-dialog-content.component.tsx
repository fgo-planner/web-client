import { Immutable, ImmutableArray, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameServant, ImmutableMasterServant, InstantiatedServantBondLevel, MasterServantUpdate, NewMasterServantUpdateType, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, InstantiatedServantUtils } from '@fgo-planner/data-core';
import { alpha, DialogContent, Tab, Tabs, Theme } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { MasterServantSelectAutocomplete } from '../master-servant-select-autocomplete.component';
import { MasterServantEditDialogCostumesTabContent } from './master-servant-edit-dialog-costumes-tab-content.component';
import { MasterServantEditDialogEnhancementsTabContent } from './master-servant-edit-dialog-enhancements-tab-content.component';
import { MasterServantEditDialogGeneralTabContent } from './master-servant-edit-dialog-general-tab-content.component';

export type MasterServantEditTab = 'general' | 'enhancements' | 'costumes';

type Props = {
    activeTab: MasterServantEditTab;
    bondLevels: ReadonlyRecord<number, InstantiatedServantBondLevel>;
    /**
     * The update payload for editing. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     */
    masterServantUpdate: MasterServantUpdate;
    onTabChange: (tab: MasterServantEditTab) => void;
    readonly?: boolean;
    showAppendSkills?: boolean;
    /**
     * Array containing the `MasterServant` objects being edited.
     *
     * If a single servant is being edited, this array should contain exactly one
     * `MasterServant`, whose `gameId` value matches that of the given
     * `masterServantUpdate`.
     *
     * If multiple servants are being edited, this array should contain all the
     * target `MasterServant`, and `masterServantUpdate.gameId` should be set to the
     * indeterminate value.
     */
    targetMasterServants: ReadonlyArray<ImmutableMasterServant>;
};

const DefaultTab = 'general';

export const StyleClassPrefix = 'MasterServantEditDialogContent';

const StyleProps = (theme: Theme) => {

    const {
        breakpoints,
        palette
    } = theme as Theme;

    return {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        [`& .${StyleClassPrefix}-input-field-group`]: {
            display: 'flex',
            flexWrap: 'nowrap',
            [breakpoints.down('sm')]: {
                flexWrap: 'wrap'
            },
            [`& .${InputFieldContainerStyleClassPrefix}-root`]: {
                flex: 1,
                px: 2,
                mt: 2,
                [breakpoints.down('sm')]: {
                    flex: '100% !important',
                    '&.empty': {
                        display: 'none'
                    }
                }
            }
        },
        [`& .${StyleClassPrefix}-tabs-container`]: {
            mt: -6,
            [breakpoints.up('sm')]: {
                mx: 4
            }
        },
        [`& .${StyleClassPrefix}-tabs-content-container`]: {
            flex: 1,
            boxSizing: 'border-box',
            overflowY: 'hidden',
            borderRadius: 1,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: alpha(palette.text.primary, 0.23),
            [breakpoints.up('sm')]: {
                position: 'relative',
                minHeight: '26.25rem',  // 420px
                maxHeight: '26.25rem'   // 420px
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantEditDialogContent = React.memo((props: Props) => {

    const gameServantMap = useGameServantMap();

    const {
        activeTab = DefaultTab,
        bondLevels,
        masterServantUpdate,
        onTabChange,
        readonly,
        showAppendSkills,
        targetMasterServants
    } = props;

    const { type } = masterServantUpdate;

    const [gameServants, setGameServants] = useState<ImmutableArray<GameServant>>([]);

    const multiEditMode = targetMasterServants.length > 1;

    const servantSelectDisabled = readonly || multiEditMode || type !== NewMasterServantUpdateType;

    /**
     * Updates the `gameServants` state when there are changes to the target master
     * servants array.
     */
    useEffect(() => {
        const gameServants: Array<Immutable<GameServant>> = [];
        if (gameServantMap && targetMasterServants.length) {
            const targetServantIds = new Set(targetMasterServants.map(({ gameId }) => gameId));
            targetServantIds.forEach(gameId => {
                gameServants.push(gameServantMap[gameId]);
            });
            // TODO Recompute level/ascension values?
        }
        setGameServants(gameServants);
    }, [gameServantMap, targetMasterServants]);


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
        /**
         * Recompute level/ascension values in case the servant rarity has changed.
         */
        const { ascension, level } = masterServantUpdate;
        if (level !== IndeterminateValue && ascension !== IndeterminateValue) {
            masterServantUpdate.level = InstantiatedServantUtils.roundToNearestValidLevel(ascension, level, gameServant.maxLevel);
        }
        /**
         * Also update the bond level.
         */
        masterServantUpdate.bondLevel = bondLevels[gameId];

        // TODO For optimization, check if the current `gameServant` value is already the same servant.
        setGameServants([gameServant]);
    }, [bondLevels, gameServantMap, servantSelectDisabled, masterServantUpdate]);

    const handleActiveTabChange = useCallback((_: SyntheticEvent, value: MasterServantEditTab) => {
        onTabChange(value);
    }, [onTabChange]);

    //#endregion


    //#region Component rendering

    /*
     * These can be undefined during the initial render.
     */
    if (!gameServantMap || !gameServants.length) {
        return null;
    }

    let tabsContentNode: ReactNode;
    if (activeTab === 'costumes') {
        tabsContentNode = (
            <MasterServantEditDialogCostumesTabContent
                masterServantUpdate={masterServantUpdate}
                gameServants={gameServants}
            />
        );
    } else if (activeTab === 'enhancements') {
        tabsContentNode = (
            <MasterServantEditDialogEnhancementsTabContent
                masterServantUpdate={masterServantUpdate}
                gameServant={multiEditMode ? undefined : gameServants[0]}
                multiEditMode={multiEditMode}
                showAppendSkills={showAppendSkills}
            />
        );
    } else {
        tabsContentNode = (
            <MasterServantEditDialogGeneralTabContent
                masterServantUpdate={masterServantUpdate}
                gameServant={multiEditMode ? undefined : gameServants[0]}
                multiEditMode={multiEditMode}
                showAppendSkills={showAppendSkills}
            />
        );
    }

    return (
        <DialogContent className={`${StyleClassPrefix}-root`} sx={StyleProps} >
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    <MasterServantSelectAutocomplete
                        selectedServant={multiEditMode ? undefined : gameServants[0]}
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
                    />
                </Tabs>
            </div>
            <div className={`${StyleClassPrefix}-tabs-content-container`}>
                {tabsContentNode}
            </div>
        </DialogContent>
    );

    //#endregion

});
