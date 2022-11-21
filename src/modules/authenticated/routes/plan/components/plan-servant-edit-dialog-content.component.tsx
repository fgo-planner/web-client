import { alpha, DialogContent, Tab, Tabs } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import { ReactNode, SyntheticEvent, useCallback, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../components/input/input-field-container.component';
import { EditDialogAction, MasterServantAggregatedData, PlanServantAggregatedData } from '../../../../../types';
import { PlanServantEditDialogData } from './plan-servant-edit-dialog-data.type';
import { PlanServantSelectAutocomplete } from './plan-servant-select-autocomplete.component';

export type PlanServantEditTab = 'enhancements' | 'costumes';

type Props = {
    activeTab: PlanServantEditTab;
    /**
     * The master servants that are available to be added to the plan.
     *
     * Only used in add mode; this is ignored in edit mode.
     */
    availableServants: ReadonlyArray<MasterServantAggregatedData>;
    /**
     * DTO containing the dialog data that will be returned to the parent component
     * on dialog close. This object will be modified directly.
     */
    dialogData: PlanServantEditDialogData;
    onTabChange: (tab: PlanServantEditTab) => void;
    /**
     * Array containing the source `PlanServantAggregatedData` objects for the
     * servants being edited.
     *
     * Only used in edit mode; this is ignored in add mode.
     */
    targetPlanServantsData: ReadonlyArray<PlanServantAggregatedData>;
};

export const StyleClassPrefix = 'PlanServantEdit';

const StyleProps = (theme: Theme) => ({
    pt: 4,
    [`& .${StyleClassPrefix}-tabs-container`]: {
        mx: 4,
        mt: -6
    },
    [`& .${StyleClassPrefix}-tabs-content-container`]: {
        height: '26.25rem',  // 420px
        mx: 2,
        px: 4,
        pt: 8,
        boxSizing: 'border-box',
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

/**
 * React.memo is not needed for this component because in most cases a re-render
 * of the parent component (`PlanServantEditDialog`) will also trigger a
 * re-render of this component.
 */
/** */
export const PlanServantEditDialogContent = (props: Props) => {

    const {
        activeTab,
        availableServants,
        dialogData: {
            action,
            data
        },
        onTabChange,
        // targetPlanServantsData
    } = props;

    const servantSelectDisabled = action === EditDialogAction.Edit;

    const [selectedServant, setSelectedServant] = useState<MasterServantAggregatedData>();


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
        // TODO Need to update ascension and level as needed.
        setSelectedServant(value);
    }, [data, servantSelectDisabled]);

    const handleActiveTabChange = useCallback((_event: SyntheticEvent, value: PlanServantEditTab): void => {
        onTabChange(value);
    }, [onTabChange]);

    //#endregion


    //#region Component rendering

    let tabsContentNode: ReactNode;
    // if (activeTab === 'costumes') {
    //     tabsContentNode = (
    //         <PlanServantEditCostumesTabContent
    //             gameServant={gameServant}
    //             targetCostumes={targetCostumes}
    //         />
    //     );
    // } else {
    //     tabsContentNode = (
    //         <PlanServantEditEnhancementsTabContent
    //             planServant={planServant}
    //             gameServant={gameServant}
    //             showAppendSkills={showAppendSkills}
    //             onChange={(e) => console.log(e)}
    //         />
    //     );
    // }
    tabsContentNode = null;

    return (
        <DialogContent className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    <PlanServantSelectAutocomplete
                        availableServants={availableServants}
                        selectedServant={selectedServant}
                        onChange={handleSelectedServantChange}
                        disabled={servantSelectDisabled}
                    />
                </InputFieldContainer>
            </div>
            <div className={`${StyleClassPrefix}-tabs-container`}>
                <Tabs value={activeTab} onChange={handleActiveTabChange}>
                    <Tab label='Enhancements' value='enhancements' />
                    <Tab label='Costumes' value='costumes' disabled />
                </Tabs>
            </div>
            <div className={`${StyleClassPrefix}-tabs-content-container`}>
                {tabsContentNode}
            </div>
        </DialogContent>
    );

    //#endregion

};
