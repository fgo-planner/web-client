import { Immutable, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameServant, InstantiatedServantBondLevel, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, InstantiatedServantUtils, MasterServantUpdate, NewMasterServantUpdateType } from '@fgo-planner/data-core';
import { alpha, DialogContent, Tab, Tabs, Theme } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { MasterServantAggregatedData } from '../../../../../../types';
import { MasterServantSelectAutocomplete } from '../master-servant-select-autocomplete.component';
import { MasterServantEditDialogCostumesTabContent } from './master-servant-edit-dialog-costumes-tab-content.component';
import { MasterServantEditDialogEnhancementsTabContent } from './master-servant-edit-dialog-enhancements-tab-content.component';
import { MasterServantEditDialogGeneralTabContent } from './master-servant-edit-dialog-general-tab-content.component';

export type MasterServantEditTab = 'general' | 'enhancements' | 'costumes';

type Props = {
    activeTab: MasterServantEditTab;
    bondLevels: ReadonlyRecord<number, InstantiatedServantBondLevel>;
    /**
     * The update payload for editing. This object will be modified directly.
     */
    masterServantUpdate: MasterServantUpdate;
    onTabChange: (tab: MasterServantEditTab) => void;
    readonly?: boolean;
    showAppendSkills?: boolean;
    /**
     * Array containing the source `MasterServantAggregatedData` objects for the
     * servants being edited.
     * 
     * If a single servant is being edited, this array should contain exactly one
     * `MasterServant`, whose `gameId` value matches that of the given
     * `masterServantUpdate`.
     *
     * If multiple servants are being edited, this array should contain all the
     * target `MasterServant`, and `masterServantUpdate.gameId` should be set to the
     * indeterminate value.
     * 
     * Only used in edit mode; this is ignored in add mode.
     */
    targetMasterServantsData: ReadonlyArray<MasterServantAggregatedData>;
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

/**
 * TODO REMOVE React.memo. It is not needed for this component because in most
 * cases a re-render of the parent component (`MasterServantEditDialog`) will
 * also trigger a re-render of this component.
 */
/** */
export const MasterServantEditDialogContent = React.memo((props: Props) => {

    const {
        activeTab = DefaultTab,
        bondLevels,
        masterServantUpdate,
        onTabChange,
        readonly,
        showAppendSkills,
        targetMasterServantsData
    } = props;

    const [selectedServant, setSelectedServant] = useState<Immutable<GameServant>>();

    const multiEditMode = targetMasterServantsData.length > 1;

    const isNewServant = masterServantUpdate.type === NewMasterServantUpdateType;

    const servantSelectDisabled = readonly || multiEditMode || !isNewServant;

    const targetGameServant = useMemo((): Immutable<GameServant> | undefined => {
        if (isNewServant) {
            return selectedServant;
        }
        if (!multiEditMode) {
            return targetMasterServantsData[0].gameServant;
        }
    }, [isNewServant, multiEditMode, selectedServant, targetMasterServantsData]);


    //#region Input event handlers

    const handleSelectedServantChange = useCallback((value: Immutable<GameServant>): void => {
        if (servantSelectDisabled) {
            return;
        }
        const gameId = value._id;
        if (masterServantUpdate.gameId === gameId) {
            return;
        }
        /**
         * Recompute level/ascension values in case the servant rarity has changed.
         */
        const { ascension, level } = masterServantUpdate;
        if (level !== IndeterminateValue && ascension !== IndeterminateValue) {
            masterServantUpdate.level = InstantiatedServantUtils.roundToNearestValidLevel(ascension, level, value.maxLevel);
        }
        /**
         * Also update the bond level.
         */
        masterServantUpdate.bondLevel = bondLevels[gameId];
        setSelectedServant(value);
    }, [bondLevels, servantSelectDisabled, masterServantUpdate]);

    const handleActiveTabChange = useCallback((_event: SyntheticEvent, value: MasterServantEditTab): void => {
        onTabChange(value);
    }, [onTabChange]);

    //#endregion


    //#region Component rendering


    let tabsContentNode: ReactNode;
    if (activeTab === 'costumes') {
        tabsContentNode = (
            <MasterServantEditDialogCostumesTabContent
                masterServantUpdate={masterServantUpdate}
                gameServants={targetGameServant || selectedServant}
            />
        );
    } else if (activeTab === 'enhancements') {
        tabsContentNode = (
            <MasterServantEditDialogEnhancementsTabContent
                masterServantUpdate={masterServantUpdate}
                gameServant={targetGameServant}
                showAppendSkills={showAppendSkills}
            />
        );
    } else {
        tabsContentNode = (
            <MasterServantEditDialogGeneralTabContent
                masterServantUpdate={masterServantUpdate}
                multiEditMode={multiEditMode}
                showAppendSkills={showAppendSkills}
            />
        );
    }

    return (
        <DialogContent className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    <MasterServantSelectAutocomplete
                        selectedServant={targetGameServant}
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
