import { CollectionUtils, Functions } from '@fgo-planner/common-core';
import { BatchMasterServantUpdate, InstantiatedServantBondLevel, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, MasterServant, MasterServantAggregatedData, MasterServantUpdateUtils } from '@fgo-planner/data-core';
import { Button, Icon, IconButton, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { useGameServantMap } from '../../../../../hooks/data/useGameServantMap';
import { useActiveBreakpoints } from '../../../../../hooks/user-interface/useActiveBreakpoints';
import { ThemeConstants } from '../../../../../styles/ThemeConstants';
import { ModalOnCloseReason } from '../../../../../types';
import { DataAggregationUtils } from '../../../../../utils/DataAggregationUtils';
import { MasterServantListColumn } from '../../../components/master/servant/list/MasterServantListColumn';
import { MasterServantList } from '../../../components/master/servant/list/MasterServantList';
import { MasterServantImportRouteExistingDialog } from './MasterServantImportRouteExistingDialog';
import { MasterServantImportExistingAction as ExistingAction } from '../MasterServantImportExistingAction.enum';

type Props = {
    hasExistingServants: boolean;
    onCancel: () => void;
    onSubmit: (existingAction?: ExistingAction) => void;
    parsedServants: Array<BatchMasterServantUpdate>;
};

const ParseResultHelperText = `The following servants were parsed from the given data. They have NOT been imported yet. Please review the
    list and click on the confirm button to finalize the import.`;

const ServantListVisibleColumns: Readonly<MasterServantListColumn.Visibility> = {
    summonDate: true,
    npLevel: true,
    level: true,
    bondLevel: true,
    fouHp: true,
    fouAtk: true,
    skills: true,
    /*
     * TODO FGO Manager does not support append skills...change this if importing
     * from a source that does.
     */
    appendSkills: false
} as const;

const StyleClassPrefix = 'MasterServantImportRouteServantList';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette
    } = theme as Theme;

    return {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        [`& .${StyleClassPrefix}-actions-row`]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            [`& .${StyleClassPrefix}-message`]: {
                color: palette.warning.main,
                px: 4,
                pt: 6,
                pb: 4
            },
            [`& .${StyleClassPrefix}-actions`]: {
                display: 'flex',
                flexWrap: 'nowrap',
                pr: 4,
                '&>.MuiButtonBase-root': {
                    '&:not(:first-of-type)': {
                        ml: 3,
                        [breakpoints.down('sm')]: {
                            ml: 1
                        }
                    }
                },
                '&>.MuiButton-root': {
                    width: '5rem'
                }
            }
        },
        [`& .${StyleClassPrefix}-main-content`]: {
            display: 'flex',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            [`& .${StyleClassPrefix}-list-container`]: {
                flex: 1,
                overflow: 'hidden'
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantImportRouteServantList = React.memo((props: Props) => {

    const gameServantMap = useGameServantMap();

    const {
        hasExistingServants,
        onCancel,
        onSubmit,
        parsedServants
    } = props;

    const [showExistingDialog, setShowExistingDialog] = useState<boolean>(false);

    const [masterServantsData, setMasterServantsData] = useState<Array<MasterServantAggregatedData>>(CollectionUtils.newArray);

    const [bondLevels, setBondLevels] = useState<Record<number, InstantiatedServantBondLevel>>(Functions.emptyObjectSupplier);

    const { sm } = useActiveBreakpoints();

    useEffect((): void => {
        if (!gameServantMap) {
            return;
        }
        const masterServants = [] as Array<MasterServant>;
        const bondLevels = {} as Record<number, InstantiatedServantBondLevel>;
        let instanceId = 0;
        for (const parsedServant of parsedServants) {
            const bondLevel = parsedServant.bondLevel;
            if (bondLevel != null && bondLevel !== IndeterminateValue) {
                bondLevels[parsedServant.servantId] = bondLevel;
            }
            const masterServant = MasterServantUpdateUtils.toMasterServant(instanceId++, parsedServant, bondLevels);
            masterServant.servantId = parsedServant.servantId;
            masterServants.push(masterServant);
        }
        const masterServantsData = DataAggregationUtils.aggregateDataForMasterServants(masterServants, gameServantMap);
        setMasterServantsData(masterServantsData);
        setBondLevels(bondLevels);
    }, [gameServantMap, parsedServants]);

    const handleSubmitButtonClick = useCallback((): void => {
        /*
         * If there are already servants in the account, then prompt the user for an
         * action.
         */
        if (hasExistingServants) {
            return setShowExistingDialog(true);
        }
        /*
         * Otherwise, just import the servants.
         */
        onSubmit();
    }, [hasExistingServants, onSubmit]);

    const handleExistingDialogAction = useCallback((_: any, reason: ModalOnCloseReason, existingAction?: ExistingAction): void => {
        setShowExistingDialog(false);
        if (reason === 'submit') {
            onSubmit(existingAction);
        }
    }, [onSubmit]);

    const actionsNode: ReactNode = (
        <div className={`${StyleClassPrefix}-actions`}>
            {sm ? <>
                <Button
                    variant='outlined'
                    color='primary'
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSubmitButtonClick}
                >
                    Confirm
                </Button>
            </> : <>
                <IconButton
                    color='primary'
                    onClick={onCancel}
                >
                    <Icon>clear</Icon>
                </IconButton>
                <IconButton
                    color='primary'
                    onClick={handleSubmitButtonClick}
                >
                    <Icon>check</Icon>
                </IconButton>
            </>}
        </div>
    );

    return <>
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-actions-row`}>
                <div className={`${StyleClassPrefix}-message`}>
                    {ParseResultHelperText}
                </div>
                {actionsNode}
            </div>
            <div className={`${StyleClassPrefix}-main-content`}>
                <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    <MasterServantList
                        masterServantsData={masterServantsData}
                        bondLevels={bondLevels}
                        showHeader
                        visibleColumns={ServantListVisibleColumns}
                    />
                </div>
            </div>
        </Box>
        <MasterServantImportRouteExistingDialog
            open={showExistingDialog}
            confirmButtonColor='primary'
            onClose={handleExistingDialogAction}
        />
    </>;

});
