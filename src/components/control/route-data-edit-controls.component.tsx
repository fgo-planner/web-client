import { Save, Undo } from '@mui/icons-material';
import { Button, IconButton, Theme } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import React, { MouseEventHandler, ReactNode } from 'react';
import { useActiveBreakpoints } from '../../hooks/user-interface/use-active-breakpoints.hook';
import { SxPropsFunction } from '../../types/internal';
import { PageTitle } from '../text/page-title.component';
import { TruncateText } from '../text/truncate-text.component';

type Props = {
    /**
     * Whether to always show the action buttons, even when `hasUnsavedData` is
     * `false`. The buttons will be visible, but disabled if `hasUnsavedData` is
     * `false`.
     */
    alwaysShowActions?: boolean;
    disabled?: boolean;
    hasUnsavedData: boolean;
    /**
     * Whether to hide the component when there is no title and no actions to be
     * displayed.
     */
    hideOnEmpty?: boolean;
    /**
     * The event handler for clicking the revert button. If this is not provided,
     * then the revert button will not be rendered.
     */
    onRevertButtonClick?: MouseEventHandler;
    onSaveButtonClick: MouseEventHandler;
    title?: string;
    unsavedMessage?: string;
};

const DefaultUnsavedMessage = 'There are unsaved changes';

const StyleClassPrefix = 'RouteDataEditControls';

const StyleProps = ((theme: Theme) => {

    const {
        breakpoints,
        palette
    } = theme;

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
        [`& .${StyleClassPrefix}-unsaved-data`]: {
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            px: 4,
            width: '100%',
            boxSizing: 'border-box',
            [`& .${StyleClassPrefix}-unsaved-message`]: {
                color: palette.warning.main,
                [breakpoints.up('sm')]: {
                    mr: 4
                }
            },
            [`& .${StyleClassPrefix}-unsaved-actions`]: {
                display: 'flex',
                flexWrap: 'nowrap',
                '&>.MuiButtonBase-root': {
                    '&:not(:first-child)': {
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
    } as SystemStyleObject;

}) as SxPropsFunction;

export const RouteDataEditControls = React.memo((props: Props) => {

    const {
        alwaysShowActions,
        disabled,
        hasUnsavedData,
        hideOnEmpty,
        onRevertButtonClick,
        onSaveButtonClick,
        title,
        unsavedMessage
    } = props;

    const { sm, md } = useActiveBreakpoints();

    console.log(sm, md);

    const titleNode = (title && (md || !hasUnsavedData)) && (
        <PageTitle className={`${StyleClassPrefix}-title`}>
            {title}
        </PageTitle>
    );

    let unsavedActionsNode: ReactNode;
    if (hasUnsavedData || alwaysShowActions) {

        const revertButton = onRevertButtonClick && (
            sm ? (
                <Button
                    variant='outlined'
                    color='primary'
                    onClick={onRevertButtonClick}
                    disabled={disabled || !hasUnsavedData}
                >
                    Revert
                </Button>
            ) : (
                <IconButton
                    color='primary'
                    onClick={onRevertButtonClick}
                    disabled={disabled || !hasUnsavedData}
                >
                    <Undo />
                </IconButton>
            )
        );

        const saveButton = sm ? (
            <Button
                variant='contained'
                color='primary'
                onClick={onSaveButtonClick}
                disabled={disabled || !hasUnsavedData}
            >
                Save
            </Button>
        ) : (
            <IconButton
                color='primary'
                onClick={onSaveButtonClick}
                disabled={disabled || !hasUnsavedData}
            >
                <Save />
            </IconButton>
        );

        unsavedActionsNode = (
            <div className={`${StyleClassPrefix}-unsaved-actions`}>
                {revertButton}
                {saveButton}
            </div>
        );
    }

    const unsavedDataNode = unsavedActionsNode && (
        <div className={`${StyleClassPrefix}-unsaved-data`}>
            <TruncateText className={`${StyleClassPrefix}-unsaved-message`}>
                {hasUnsavedData && (unsavedMessage || DefaultUnsavedMessage)}
            </TruncateText>
            {unsavedActionsNode}
        </div>
    );

    const hidden = hideOnEmpty && !titleNode && !unsavedDataNode;

    console.log(hideOnEmpty, !titleNode, !unsavedDataNode, hidden);

    if (hidden) {
        return null;
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {titleNode}
            {unsavedDataNode}
        </Box>
    );

});
