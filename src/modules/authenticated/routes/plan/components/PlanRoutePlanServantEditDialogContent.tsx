import { CollectionUtils } from '@fgo-planner/common-core';
import { MasterServantAggregatedData, PlanServantAggregatedData } from '@fgo-planner/data-core';
import { alpha, DialogContent, Tab, Tabs } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme, Theme } from '@mui/system';
import { ReactNode, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../components/input/InputFieldContainer';
import { useGameServantCostumesData } from '../../../../../hooks/data/useGameServantCostumesData';
import { EditDialogAction } from '../../../../../types';
import { PlanRoutePlanServantEditDialogAutocomplete } from './PlanRoutePlanServantEditDialogAutocomplete';
import { PlanRoutePlanServantEditDialogCostumesTabContent } from './PlanRoutePlanServantEditDialogCostumesTabContent';
import { PlanRoutePlanServantEditDialogData } from './PlanRoutePlanServantEditDialogData.type';
import { PlanRoutePlanServantEditDialogEnhancementsTabContent } from './PlanRoutePlanServantEditDialogEnhancementsTabContent';

export type PlanServantEditTab = 'enhancements' | 'costumes';

type Props = {
    activeTab: PlanServantEditTab;
    /**
     * DTO containing the dialog data that will be returned to the parent component
     * on dialog close. Data contained in this object may be modified directly.
     */
    dialogData: PlanRoutePlanServantEditDialogData;
    /**
     * Array containing the source `PlanServantAggregatedData` objects for the
     * servants being edited.
     *
     * Only used in edit mode; this is ignored in add mode.
     */
    targetPlanServantsData: ReadonlyArray<PlanServantAggregatedData>;
    onTabChange: (tab: PlanServantEditTab) => void;
};

export const StyleClassPrefix = 'PlanRoutePlanServantEditDialogContent';

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
 * of the parent component (`PlanServantEditDialog`) will also trigger a
 * re-render of this component.
 */
/** */
export const PlanRoutePlanServantEditDialogContent: React.FC<Props> = (props: Props): JSX.Element => {

    const {
        activeTab,
        dialogData: {
            action,
            data
        },
        onTabChange,
        targetPlanServantsData
    } = props;

    /**
     * This is used as a data source by children components. The source of this data
     * depends on whether the dialog in add mode or edit mode.
     *
     * In add mode, the array contains at most one element which corresponds to the
     * selected servant. If no servant is select, then this will be an empty array.
     *
     * In edit mode, this is the `targetPlanServantsData` data passed from the props
     * (it is possible to do this since `PlanServantAggregatedData` extends
     * `MasterServantAggregatedData`, and both arrays are meant to be readonly).
     */
    const [
        targetMasterServantsData,
        setTargetMasterServantsData
    ] = useState<ReadonlyArray<MasterServantAggregatedData>>(CollectionUtils.emptyArray);

    /**
     * Updates `targetMasterServantsData` whenever the `targetPlanServantsData`
     * reference changes in edit mode (will not do anything in add mode).
     */
    useEffect(() => {
        if (action === EditDialogAction.Add) {
            return;
        }
        setTargetMasterServantsData(targetPlanServantsData);
    }, [action, targetPlanServantsData]);

    /**
     * Compute the costumes data here instead of inside the costumes tab
     * component(s) to avoid recomputing every time the user changes to/from the
     * costumes tab (tab components are unmounted/remounted when the user switches
     * from/to the respective tab).
     */
    /** */
    const costumesData = useGameServantCostumesData(targetMasterServantsData);

    const servantSelectDisabled = action === EditDialogAction.Edit;


    //#region Input event handlers

    const handleSelectedServantChange = useCallback((value: MasterServantAggregatedData): void => {
        if (servantSelectDisabled) {
            return;
        }
        const instanceId = value.instanceId;
        if (data.instanceId === instanceId) {
            return;
        }
        data.instanceId = instanceId;
        /**
         * Clear costume selection when switching servants.
         */
        data.update.costumes.clear();
        // TODO Need to update ascension and level as needed.
        setTargetMasterServantsData([value]);
    }, [data, servantSelectDisabled]);

    const handleActiveTabChange = useCallback((_event: SyntheticEvent, value: PlanServantEditTab): void => {
        onTabChange(value);
    }, [onTabChange]);

    //#endregion


    //#region Component rendering

    let tabsContentNode: ReactNode;
    if (activeTab === 'costumes') {
        tabsContentNode = (
            <PlanRoutePlanServantEditDialogCostumesTabContent
                costumesData={costumesData}
                planServantUpdate={data.update}
                unlockedCostumes={data.unlockedCostumes}
            />
        );
    } else {
        tabsContentNode = (
            <PlanRoutePlanServantEditDialogEnhancementsTabContent
                planServantUpdate={data.update}
                targetMasterServantsData={targetMasterServantsData}
            />
        );
    }

    return (
        <DialogContent className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    <PlanRoutePlanServantEditDialogAutocomplete
                        availableServants={data.availableServants}
                        selectedServant={targetMasterServantsData[0]}
                        onChange={handleSelectedServantChange}
                        disabled={servantSelectDisabled}
                    />
                </InputFieldContainer>
            </div>
            <div className={`${StyleClassPrefix}-tabs-container`}>
                <Tabs value={activeTab} onChange={handleActiveTabChange}>
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

};
