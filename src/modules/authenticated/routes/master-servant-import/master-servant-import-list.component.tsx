import { MasterServant, MasterServantBondLevel } from '@fgo-planner/data-types';
import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';
import { Button, IconButton, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { MasterServantParserResult } from '../../../../services/import/master-servant-parser-result.type';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { MasterServantUpdateIndeterminateValue as IndeterminateValue, ModalOnCloseReason } from '../../../../types/internal';
import { MasterServantUpdateUtils } from '../../../../utils/master/master-servant-update.utils';
import { MasterServantListVisibleColumns } from '../../components/master/servant/list/master-servant-list-columns';
import { MasterServantList } from '../../components/master/servant/list/master-servant-list.component';
import { MasterServantImportExistingDialog } from './master-servant-import-existing-dialog.component';
import { MasterServantImportExistingAction as ExistingAction } from './master-servant-import-existing-servants-action.enum';

type Props = {
    parsedData: MasterServantParserResult;
    hasExistingServants: boolean;
    onCancel: () => void;
    onSubmit: (existingAction?: ExistingAction) => void;
};

const ParseResultHelperText = `The following servants were parsed from the given data. They have NOT been imported yet. Please review the
    list and click on the confirm button to finalize the import.`;

const ServantListVisibleColumns: MasterServantListVisibleColumns = {
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
};

const StyleClassPrefix = 'MasterServantImportList';

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

export const MasterServantImportList = React.memo((props: Props) => {

    const {
        parsedData: {
            servantUpdates: parsedMasterServantUpdates
        },
        hasExistingServants,
        onCancel,
        onSubmit
    } = props;

    const [showExistingDialog, setShowExistingDialog] = useState<boolean>(false);

    const { sm } = useActiveBreakpoints();

    const masterServantListData = useMemo((): {
        masterServants: Array<MasterServant>;
        bondLevels: Record<number, MasterServantBondLevel>;
    } => {
        const masterServants = [] as Array<MasterServant>;
        const bondLevels = {} as Record<number, MasterServantBondLevel>;
        let instanceId = 0;
        for (const parsedUpdate of parsedMasterServantUpdates) {
            const bondLevel = parsedUpdate.bondLevel;
            if (bondLevel !== undefined && bondLevel !== IndeterminateValue) {
                bondLevels[parsedUpdate.gameId] = bondLevel;
            }
            const masterServant = MasterServantUpdateUtils.convertToMasterServant(instanceId++, parsedUpdate, bondLevels);
            masterServants.push(masterServant);
        }
        return { masterServants, bondLevels };
    }, [parsedMasterServantUpdates]);

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

    const handleExistingDialogAction = useCallback((event: any, reason: ModalOnCloseReason, existingAction?: ExistingAction): void => {
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
                    <ClearIcon />
                </IconButton>
                <IconButton
                    color='primary'
                    onClick={handleSubmitButtonClick}
                >
                    <CheckIcon />
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
                        masterServants={masterServantListData.masterServants}
                        bondLevels={masterServantListData.bondLevels}
                        showHeader
                        visibleColumns={ServantListVisibleColumns}
                    />
                </div>
            </div>
        </Box>
        <MasterServantImportExistingDialog
            open={showExistingDialog}
            confirmButtonColor='primary'
            onClose={handleExistingDialogAction}
        />
    </>;

});
