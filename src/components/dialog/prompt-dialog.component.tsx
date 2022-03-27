import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React, { Fragment, MouseEvent, ReactNode, useCallback, useRef } from 'react';
import { useAutoResizeDialog } from '../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps } from '../../types/internal';
import { DialogCloseButton } from './dialog-close-button.component';

type Props = {
    title?: string;
    prompt?: ReactNode;
    cancelButtonLabel?: string;
    cancelButtonColor?: ButtonProps['color'];
    confirmButtonLabel?: string;
    confirmButtonColor?: ButtonProps['color'];
} & Omit<DialogComponentProps, 'onExited'>;

/**
 * Generic dialog for displaying a simple prompt with an action button and a
 * cancel button.
 */
export const PromptDialog = React.memo((props: Props) => {

    const {
        classes,
        title,
        prompt,
        cancelButtonLabel,
        cancelButtonColor,
        confirmButtonLabel,
        confirmButtonColor,
        onClose,
        ...dialogProps
    } = props;

    /**
     * Contains cache of the dialog contents.
     */
    const dialogContentsRef = useRef<JSX.Element>();

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const showTitle = title || closeIconEnabled;

    const cancel = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    /*
     * Only re-render the dialog contents if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (!dialogContentsRef.current || props.open) {
        dialogContentsRef.current = (
            <Fragment>
                {showTitle &&
                    <DialogTitle>
                        {title}
                        {closeIconEnabled && <DialogCloseButton onClick={cancel} />}
                    </DialogTitle>
                }
                <DialogContent>
                    {prompt && <DialogContentText>{prompt}</DialogContentText>}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant={actionButtonVariant}
                        color={cancelButtonColor}
                        onClick={e => onClose(e, 'cancel')}
                    >
                        {cancelButtonLabel || 'Cancel'}
                    </Button>
                    <Button
                        variant={actionButtonVariant}
                        color={confirmButtonColor}
                        onClick={e => onClose(e, 'submit')}
                    >
                        {confirmButtonLabel || 'Confirm'}
                    </Button>
                </DialogActions>
            </Fragment>
        );
    }

    return (
        <Dialog
            {...dialogProps}
            fullScreen={fullScreen}
            onClose={onClose}
        >
            {dialogContentsRef.current}
        </Dialog>
    );

});
