import { Clear as ClearIcon, Done as DoneIcon } from '@mui/icons-material';
import { Fab, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { Fragment, ReactNode, useCallback, useState } from 'react';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPanelContainer, StyleClassPrefix as LayoutPanelContainerStyleClassPrefix } from '../../../../components/layout/layout-panel-container.component';
import { MasterServantParserResult } from '../../../../services/import/master-servant-parser-result.type';
import { ModalOnCloseReason } from '../../../../types/internal';
import { MasterServantListVisibleColumns } from '../../components/master/servant/list/master-servant-list-columns';
import { MasterServantListHeader } from '../../components/master/servant/list/master-servant-list-header.component';
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
    [`& .${LayoutPanelContainerStyleClassPrefix}-root`]: {
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

    const { masterServants, bondLevels } = parsedData;

    const [showExistingDialog, setShowExistingDialog] = useState<boolean>(false);

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
            <Tooltip title="Cancel">
                <div>
                    <Fab
                        color="default"
                        onClick={onCancel}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>
            <Tooltip title="Confirm">
                <div>
                    <Fab
                        color="primary"
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
                <LayoutPanelContainer>
                    <MasterServantListHeader
                        visibleColumns={ServantListVisibleColumns}
                    />
                    <MasterServantList
                        openLinksInNewTab
                        masterServants={masterServants}
                        bondLevels={bondLevels}
                        visibleColumns={ServantListVisibleColumns}
                    />
                </LayoutPanelContainer>
            </Box>
            {fabContainerNode}
            <MasterServantImportExistingDialog
                open={showExistingDialog}
                confirmButtonColor="primary"
                onClose={handleExistingDialogAction}
            />
        </Fragment>
    );

});
