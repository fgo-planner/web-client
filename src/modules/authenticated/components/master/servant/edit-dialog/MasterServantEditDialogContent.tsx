import { CollectionUtils, Immutable, ImmutableArray } from '@fgo-planner/common-core';
import { GameServant, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, InstantiatedServantUtils, MasterServantAggregatedData } from '@fgo-planner/data-core';
import { alpha, DialogContent, Tab, Tabs, Theme } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import { ReactNode, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/InputFieldContainer';
import { useGameServantCostumesData } from '../../../../../../hooks/data/useGameServantCostumesData';
import { EditDialogAction } from '../../../../../../types';
import { MasterServantEditDialogAutocomplete } from './MasterServantEditDialogAutocomplete';
import { MasterServantEditDialogCostumesTabContent } from './MasterServantEditDialogCostumesTabContent';
import { MasterServantEditDialogData } from './MasterServantEditDialogData.type';
import { MasterServantEditDialogEnhancementsTabContent } from './MasterServantEditDialogEnhancementsTabContent';
import { MasterServantEditDialogGeneralTabContent } from './MasterServantEditDialogGeneralTabContent';
import { MasterServantEditDialogTab } from './MasterServantEditDialogTab.enum';

type Props = {
    activeTab: MasterServantEditDialogTab;
    /**
     * DTO containing the dialog data that will be returned to the parent component
     * on dialog close. Data contained in this object may be modified directly.
     */
    dialogData: MasterServantEditDialogData;
    onTabChange: (tab: MasterServantEditDialogTab) => void;
    readonly?: boolean;
    showAppendSkills?: boolean;
    /**
     * Array containing the source `MasterServantAggregatedData` objects for the
     * servants being edited.
     * 
     * If a single servant is being edited, this array should contain exactly one
     * `MasterServant`, whose `servantId` value matches that of the given
     * `masterServantUpdate`.
     *
     * If multiple servants are being edited, this array should contain all the
     * target `MasterServant`, and `masterServantUpdate.servantId` should be set to the
     * indeterminate value.
     * 
     * Only used in edit mode; this is ignored in add mode.
     */
    targetMasterServantsData: ReadonlyArray<MasterServantAggregatedData>;
};

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
 * React.memo is not needed for this component because in most cases a re-render
 * of the parent component (`MasterServantEditDialog`) will also trigger a
 * re-render of this component.
 */
/** */
export const MasterServantEditDialogContent = (props: Props) => {

    const {
        activeTab,
        dialogData: {
            action,
            data
        },
        onTabChange,
        readonly,
        showAppendSkills,
        targetMasterServantsData
    } = props;

    /**
     * This is used as a data source by children components. The source of this data
     * depends on whether the dialog in add mode or edit mode.
     *
     * In add mode, the array contains at most one element which corresponds to the
     * selected servant. If no servant is select, then this will be an empty array.
     *
     * In edit mode, this is derived from the `targetMasterServantsData` data passed
     * from the props.
     */
    const [
        targetGameServantsData, 
        setTargetGameServantsData
    ] = useState<ImmutableArray<GameServant>>(CollectionUtils.emptyArray);

    /**
     * Updates `targetGameServantsData` whenever the `targetMasterServantsData`
     * reference changes in edit mode (will not do anything in add mode).
     */
    useEffect(() => {
        if (action === EditDialogAction.Add) {
            return;
        }
        setTargetGameServantsData(targetMasterServantsData.map(data => data.gameServant));
    }, [action, targetMasterServantsData]);

    /**
     * Compute the costumes data here instead of inside the costumes tab
     * component(s) to avoid recomputing every time the user changes to/from the
     * costumes tab (tab components are unmounted/remounted when the user switches
     * from/to the respective tab).
     */
    /** */
    const costumesData = useGameServantCostumesData(targetGameServantsData);

    const isEditMode = action === EditDialogAction.Edit;

    const multiEditMode = isEditMode && targetMasterServantsData.length > 1;

    const servantSelectDisabled = readonly || isEditMode;


    //#region Input event handlers

    const handleSelectedServantChange = useCallback((value: Immutable<GameServant>): void => {
        if (servantSelectDisabled) {
            return;
        }
        const servantId = value._id;
        if (data.servantId === servantId) {
            return;
        }
        data.servantId = servantId;
        const { bondLevels, update } = data;
        const { ascension, level } = update;
        /**
         * Recompute level/ascension values in case the servant rarity has changed.
         */
        if (level !== IndeterminateValue && ascension !== IndeterminateValue) {
            update.level = InstantiatedServantUtils.roundToNearestValidLevel(ascension, level, value.maxLevel);
        }
        /**
         * Also update the bond level.
         */
        update.bondLevel = bondLevels[servantId];
        setTargetGameServantsData([value]);
    }, [servantSelectDisabled, data]);

    const handleActiveTabChange = useCallback((_event: SyntheticEvent, value: MasterServantEditDialogTab): void => {
        onTabChange(value);
    }, [onTabChange]);

    //#endregion


    //#region Component rendering

    let tabsContentNode: ReactNode;
    if (activeTab === MasterServantEditDialogTab.Costumes) {
        tabsContentNode = (
            <MasterServantEditDialogCostumesTabContent
                costumesData={costumesData}
                masterServantUpdate={data.update}
            />
        );
    } else if (activeTab === MasterServantEditDialogTab.Enhancements) {
        tabsContentNode = (
            <MasterServantEditDialogEnhancementsTabContent
                masterServantUpdate={data.update}
                multiEditMode={multiEditMode}
                targetGameServantsData={targetGameServantsData}
            />
        );
    } else {
        tabsContentNode = (
            <MasterServantEditDialogGeneralTabContent
                masterServantUpdate={data.update}
                multiEditMode={multiEditMode}
                showAppendSkills={showAppendSkills}
            />
        );
    }

    return (
        <DialogContent className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    <MasterServantEditDialogAutocomplete
                        multiEditMode={multiEditMode}
                        selectedServant={targetGameServantsData[0]}
                        onChange={handleSelectedServantChange}
                        disabled={servantSelectDisabled}
                    />
                </InputFieldContainer>
            </div>
            <div className={`${StyleClassPrefix}-tabs-container`}>
                <Tabs value={activeTab} onChange={handleActiveTabChange}>
                    <Tab
                        label={MasterServantEditDialogTab.General}
                        value={MasterServantEditDialogTab.General}
                    />
                    <Tab
                        label={MasterServantEditDialogTab.Enhancements}
                        value={MasterServantEditDialogTab.Enhancements}
                    />
                    <Tab
                        label={MasterServantEditDialogTab.Costumes}
                        value={MasterServantEditDialogTab.Costumes}
                    />
                </Tabs>
            </div>
            <div className={`${StyleClassPrefix}-tabs-content-container`}>
                {tabsContentNode}
            </div>
        </DialogContent>
    );

    //#endregion

};
