import { Button, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { DropzoneRef } from 'react-dropzone';
import { FileInputWithTextarea } from '../../../../../components/input/FileInputWithTextarea';

type Props = {
    onSubmit: (data: string) => void;
    disableSubmit?: boolean;
};

const FileInputHelperText = 'To import the servant data from FGO Manager, download the \'Roster\' sheet as a .csv file and upload it here.';

const FileInputActionsHelperText = 'Select or drag and drop the .csv file here, or paste the file contents above';

const StyleClassPrefix = 'MasterServantImportRouteFileInput';

const StyleProps = (theme: SystemTheme) => {

    const { palette } = theme as Theme;

    return {
        px: 4,
        pt: 6,
        [`& .${StyleClassPrefix}-helper-text`]: {
            color: palette.text.secondary,
            px: 4
        },
        [`& .${StyleClassPrefix}-actions-row`]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            pt: 4,
            '&>.MuiButton-root:not(:last-of-type)': {
                mr: 4
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantImportRouteFileInput = React.memo(({ onSubmit, disableSubmit }: Props) => {

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

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-helper-text`}>
                {FileInputHelperText}
            </div>
            <FileInputWithTextarea
                dropzoneRef={dropzoneRef}
                rows={15}
                value={importData}
                onValueChange={setImportData}
            >
                <div className={`${StyleClassPrefix}-actions-row`}>
                    <div className={`${StyleClassPrefix}-helper-text`}>
                        {FileInputActionsHelperText}
                    </div>
                    <Button
                        variant='contained'
                        color='secondary'
                        onClick={openFileUploadDialog}
                    >
                        Select File
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleSubmitButtonClick}
                        disabled={!hasImportData}
                    >
                        Parse Data
                    </Button>
                </div>
            </FileInputWithTextarea>
        </Box>
    );

});
