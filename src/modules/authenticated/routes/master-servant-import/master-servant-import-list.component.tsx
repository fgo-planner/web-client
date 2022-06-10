import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Clear as ClearIcon, Done as DoneIcon } from '@mui/icons-material';
import { Fab, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { Fragment, ReactNode, useCallback, useMemo, useState } from 'react';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutContentSection, StyleClassPrefix as LayoutContentSectionStyleClassPrefix } from '../../../../components/layout/layout-content-section.component';
import { MasterServantParserResult } from '../../../../services/import/master-servant-parser-result.type';
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

// TODO Make this responsive.
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
    appendSkills: false,
    actions: false
};

const StyleClassPrefix = 'MasterServantImportList';

const StyleProps = (theme: Theme) => ({
    mb: 20,
    [`& .${StyleClassPrefix}-helper-text`]: {
        color: 'text.secondary',
        minWidth: theme.breakpoints.values.lg,
        px: 4,
        pt: 6,
        pb: 4
    },
    [`& .${StyleClassPrefix}-footer-padding`]: {
        py: 10
    },
    [`& .${LayoutContentSectionStyleClassPrefix}-root`]: {
        p: 4
    }
} as SystemStyleObject<Theme>);

export const MasterServantImportList = React.memo((props: Props) => {

    const {
        parsedData,
        hasExistingServants,
        onCancel,
        onSubmit
    } = props;

    const [showExistingDialog, setShowExistingDialog] = useState<boolean>(false);

    const parsedMasterServantUpdates = parsedData.servantUpdates;

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

    const fabContainerNode: ReactNode = (
        <FabContainer>
            <Tooltip title='Cancel'>
                <div>
                    <Fab
                        color='default'
                        onClick={onCancel}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>
            <Tooltip title='Confirm'>
                <div>
                    <Fab
                        color='primary'
                        onClick={handleSubmitButtonClick}
                        children={<DoneIcon />}
                    />
                </div>
            </Tooltip>
        </FabContainer>
    );

    return (
        <Fragment>
            <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
                <div className={`${StyleClassPrefix}-helper-text`}>
                    {ParseResultHelperText}
                </div>
                <LayoutContentSection>
                    <MasterServantList
                        masterServants={masterServantListData.masterServants}
                        bondLevels={masterServantListData.bondLevels}
                        visibleColumns={ServantListVisibleColumns}
                    />
                </LayoutContentSection>
            </Box>
            {fabContainerNode}
            <MasterServantImportExistingDialog
                open={showExistingDialog}
                confirmButtonColor='primary'
                onClose={handleExistingDialogAction}
            />
        </Fragment>
    );

});
