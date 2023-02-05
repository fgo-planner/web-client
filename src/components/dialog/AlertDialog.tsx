import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React, { Fragment, MouseEvent, useCallback, useRef } from 'react';
import { useAutoResizeDialog } from '../../hooks/user-interface/useAutoResizeDialog';
import { DialogComponentProps } from '../../types';
import { DialogCloseButton } from './DialogCloseButton';

type Props = {
    title?: string;
    message?: string;
    confirmButtonLabel?: string;
    confirmButtonColor?: ButtonProps['color'];
} & Omit<DialogComponentProps, 'onExited'>;

/**
 * Generic dialog for displaying a simple alert with an confirmation button.
 */
export const AlertDialog = React.memo((props: Props) => {

    const {
        title,
        message,
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
                    {message && <DialogContentText>{message}</DialogContentText>}
                </DialogContent>
                <DialogActions>
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
