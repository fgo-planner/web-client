import { Publish as PublishIcon } from '@mui/icons-material';
import { Button, Fab, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { Fragment, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { DropzoneRef } from 'react-dropzone';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { FileInputWithTextarea } from '../../../../components/input/file-input-with-textarea.component';

type Props = {
    onSubmit: (data: string) => void;
    disableSubmit?: boolean;
};

const FileInputHelperText = 'To import the servant data from FGO Manager, download the \'Roster\' sheet as a .csv file and upload it here.';

const FileInputActionsHelperText = 'Select or drag and drop the .csv file here, or paste the file contents above';

const StyleClassPrefix = 'MasterServantImportFileInput';

const StyleProps = {
    [`& .${StyleClassPrefix}-helper-text`]: {
        color: 'text.secondary',
        px: 8,
        pt: 6
    },
    [`& .${StyleClassPrefix}-input-container`]: {
        p: 4
    },
    [`& .${StyleClassPrefix}-input-actions`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pt: 4
    },
    [`& .${StyleClassPrefix}-input-actions-helper-text`]: {
        color: 'text.secondary',
        pr: 4
    }
} as SystemStyleObject<Theme>;

export const MasterServantImportFileInput = React.memo(({ onSubmit, disableSubmit }: Props) => {

    const [importData, setImportData] = useState<string>();

    const dropzoneRef = useRef<DropzoneRef | null>(null);

    const openFileUploadDialog = useCallback((): void => {
        // Note that the ref is set async, so it might be null at some point.
        dropzoneRef.current?.open();
    }, []);

    const hasImportData = useMemo((): boolean => {
        return !!importData?.trim().length;
    }, [importData]);

    const handleSubmitButtonClick = useCallback((): void => {
        onSubmit(importData || '');
    }, [importData, onSubmit]);

    const fabContainerNode: ReactNode = (
        <FabContainer>
            <Tooltip title="Parse data">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleSubmitButtonClick}
                        disabled={!hasImportData || disableSubmit}
                        children={<PublishIcon />}
                    />
                </div>
            </Tooltip>
        </FabContainer>
    );

    return (
        <Fragment>
            <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
                <div className={`${StyleClassPrefix}-helper-text`}>
                    {FileInputHelperText}
                </div>
                <div className={`${StyleClassPrefix}-input-container`}>
                    <FileInputWithTextarea
                        dropzoneRef={dropzoneRef}
                        rows={15}
                        value={importData}
                        onValueChange={setImportData}
                    >
                        <div className={`${StyleClassPrefix}-input-actions`}>
                            <div className={`${StyleClassPrefix}-input-actions-helper-text`}>
                                {FileInputActionsHelperText}
                            </div>
                            <Button variant="contained" color="secondary" onClick={openFileUploadDialog}>
                                Select File
                            </Button>
                        </div>
                    </FileInputWithTextarea>
                </div>
            </Box>
            {fabContainerNode}
        </Fragment>
    );

});
