import { Button, Icon, IconButton, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { MouseEventHandler, ReactNode } from 'react';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/useActiveBreakpoints';
import { PageTitle } from '../../../../components/text/PageTitle';
import { TruncateText } from '../../../../components/text/TruncateText';

type Props = {
    dirtyDataMessage?: string;
    disabled?: boolean;
    isDataDirty: boolean;
    isDataStale: boolean;
    /**
     * Whether to hide the component when there is no title and no actions to be
     * displayed.
     */
    hideOnEmpty?: boolean;
    staleDataMessage?: string;
    title?: string;
    onReloadButtonClick?: MouseEventHandler;
    onRevertButtonClick: MouseEventHandler;
    onSaveButtonClick: MouseEventHandler;
};

const DefaultDirtyDataMessage = 'There are unsaved changes';

const DefaultStaleDataMessage = 'External changes detected, sync to reload data';

const StyleClassPrefix = 'RouteDataEditControls';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette
    } = theme as Theme;

    return {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '4rem',
        height: '4rem',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: palette.divider,
        [`& .${StyleClassPrefix}-title`]: {
            pb: 4
        },
        [`& .${StyleClassPrefix}-prompt`]: {
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            px: 4,
            width: '100%',
            boxSizing: 'border-box',
            [`& .${StyleClassPrefix}-message`]: {
                color: palette.warning.main,
                [breakpoints.up('sm')]: {
                    mr: 4
                }
            },
            [`& .${StyleClassPrefix}-actions`]: {
                display: 'flex',
                flexWrap: 'nowrap',
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
            },
            [breakpoints.down('sm')]: {
                justifyContent: 'space-between',
                pr: 3
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const RouteDataEditControls = React.memo((props: Props) => {

    const {
        dirtyDataMessage = DefaultDirtyDataMessage,
        disabled,
        isDataDirty,
        isDataStale,
        hideOnEmpty,
        staleDataMessage = DefaultStaleDataMessage,
        title,
        onReloadButtonClick,
        onRevertButtonClick,
        onSaveButtonClick
    } = props;

    const { sm, md } = useActiveBreakpoints();

    const showPrompt = isDataDirty || isDataStale;

    const titleNode = (title && (md || !showPrompt)) && (
        <PageTitle className={`${StyleClassPrefix}-title`}>
            {title}
        </PageTitle>
    );

    let actionButtonsNode: ReactNode;
    if (showPrompt) {

        let revertButton: ReactNode;
        if (isDataStale) {
            revertButton = (
                sm ? (
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={onReloadButtonClick}
                        disabled={disabled}
                    >
                        Sync
                    </Button>
                ) : (
                    <IconButton
                        color='primary'
                        onClick={onReloadButtonClick}
                        disabled={disabled}
                    >
                        <Icon>sync</Icon>
                    </IconButton>
                )
            );
        } else {
            revertButton = (
                sm ? (
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={onRevertButtonClick}
                        disabled={disabled}
                    >
                        Revert
                    </Button>
                ) : (
                    <IconButton
                        color='primary'
                        onClick={onRevertButtonClick}
                        disabled={disabled}
                    >
                        <Icon>undo</Icon>
                    </IconButton>
                )
            );
        }

        let saveButton: ReactNode;
        if (isDataDirty) {
            saveButton = sm ? (
                <Button
                    variant='contained'
                    color='primary'
                    onClick={onSaveButtonClick}
                    disabled={disabled}
                >
                    Save
                </Button>
            ) : (
                <IconButton
                    color='primary'
                    onClick={onSaveButtonClick}
                    disabled={disabled}
                >
                    <Icon>save</Icon>
                </IconButton>
            );
        }

        actionButtonsNode = (
            <div className={`${StyleClassPrefix}-actions`}>
                {revertButton}
                {saveButton}
            </div>
        );
    }

    const promptNode = actionButtonsNode && (
        <div className={`${StyleClassPrefix}-prompt`}>
            <TruncateText className={`${StyleClassPrefix}-message`}>
                {isDataStale ? staleDataMessage : dirtyDataMessage}
            </TruncateText>
            {actionButtonsNode}
        </div>
    );

    const hidden = hideOnEmpty && !titleNode && !promptNode;

    if (hidden) {
        return null;
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {titleNode}
            {promptNode}
        </Box>
    );

});
