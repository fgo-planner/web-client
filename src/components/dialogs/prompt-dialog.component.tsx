import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ModalProps } from '@material-ui/core';
import React, { MouseEvent } from 'react';

type Props = {
    title?: string;
    prompt?: string;
    cancelButtonLabel?: string;
    cancelButtonColor?: ButtonProps['color'];
    confirmButtonLabel?: string;
    confirmButtonColor?: ButtonProps['color'];
    onAction: (event: MouseEvent, value: boolean) => void;
} & Omit<ModalProps, 'children'>;

export const PromptDialog = React.memo((props: Props) => {
    
    const {
        title,
        prompt,
        cancelButtonLabel,
        cancelButtonColor,
        confirmButtonLabel,
        confirmButtonColor,
        onAction,
        ...dialogProps
    } = props;

    return (
        <Dialog {...dialogProps}>
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent>
                {prompt && <DialogContentText>{prompt}</DialogContentText>}
            </DialogContent>
            <DialogActions>
                <Button color={cancelButtonColor} onClick={e => onAction(e, false)}>
                    {cancelButtonLabel || 'Cancel'}
                </Button>
                <Button color={confirmButtonColor} onClick={e => onAction(e, true)}>
                    {confirmButtonLabel || 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
