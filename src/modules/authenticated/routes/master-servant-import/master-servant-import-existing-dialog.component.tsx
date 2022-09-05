import { ReadonlyRecord } from '@fgo-planner/common-types';
import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, SelectProps, TextField } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { ChangeEvent, CSSProperties, MouseEvent, useCallback, useState } from 'react';
import { DialogCloseButton } from '../../../../components/dialog/dialog-close-button.component';
import { InputFieldContainer , StyleClassPrefix as InputFieldContainerStyleClassPrefix} from '../../../../components/input/input-field-container.component';
import { useAutoResizeDialog } from '../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps } from '../../../../types/internal';
import { MasterServantImportExistingAction as ExistingAction } from './master-servant-import-existing-servants-action.enum';

type RenderedProps = {
    cancelButtonColor?: ButtonProps['color'];
    confirmButtonColor?: ButtonProps['color'];
};

type Props = RenderedProps & Omit<DialogComponentProps<ExistingAction>, 'onExited'>;

const Prompt = 'There are existing servants on this account. Please select one of the actions below.';

const HelperTextPrefix = 'By selecting this action,';

const AppendHelperText = 'the imported servants will be appended to the existing servant list.';

const UpdateHelperText = 'any servants that already exist will be updated, and any new servant will be added.';

const OverwriteHelperText = 'the entire list of existing servants will be wiped out replaced with the imported servants.';

const HelperTexts = {
    [ExistingAction.Append]: AppendHelperText,
    [ExistingAction.Update]: UpdateHelperText,
    [ExistingAction.Overwrite]: OverwriteHelperText
} as ReadonlyRecord<ExistingAction, string>;

const SelectMenuProps = {
    MenuProps: {
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center'
        },
        transformOrigin: {
            vertical: 'top',
            horizontal: 'center'
        }
    }
} as Partial<SelectProps>;

const StyleClassPrefix = 'MasterServantImportExistingDialog';

const StyleProps = {
    [`& .${InputFieldContainerStyleClassPrefix}-root`]: {
        py: 5,
        my: 3
    }
} as SystemStyleObject<Theme>;

const MenuItemStyle = {
    height: 54
} as CSSProperties;

export const MasterServantImportExistingDialog = React.memo((props: Props) => {

    const {
        cancelButtonColor,
        confirmButtonColor,
        onClose,
        ...dialogProps
    } = props;

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const [existingAction, setExistingAction] = useState<ExistingAction>(ExistingAction.Update);

    const handleExistingActionChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value as ExistingAction;
        setExistingAction(value);
    }, []);

    const handleCloseButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    const handleSubmitButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'submit', existingAction);
    }, [existingAction, onClose]);

    return (
        <Dialog 
            {...dialogProps} 
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            fullScreen={fullScreen}
            onClose={onClose}
        >
            <DialogTitle>
                {closeIconEnabled && <DialogCloseButton onClick={handleCloseButtonClick} />}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>{Prompt}</DialogContentText>
                <InputFieldContainer width={240}>
                    <TextField
                        variant='outlined'
                        color='secondary'
                        select
                        fullWidth
                        label='Action'
                        SelectProps={SelectMenuProps}
                        value={existingAction}
                        onChange={handleExistingActionChange}
                    >
                        <MenuItem value={ExistingAction.Update} style={MenuItemStyle}>
                            {ExistingAction.Update}
                        </MenuItem>
                        <MenuItem value={ExistingAction.Append} style={MenuItemStyle}>
                            {ExistingAction.Append}
                        </MenuItem>
                        <MenuItem value={ExistingAction.Overwrite} style={MenuItemStyle}>
                            {ExistingAction.Overwrite}
                        </MenuItem>
                    </TextField>
                </InputFieldContainer>
                <DialogContentText>{HelperTextPrefix} {HelperTexts[existingAction]}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant={actionButtonVariant}
                    color={cancelButtonColor}
                    onClick={handleCloseButtonClick}
                >
                    Cancel
                </Button>
                <Button
                    variant={actionButtonVariant}
                    color={confirmButtonColor}
                    onClick={handleSubmitButtonClick}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );

});
