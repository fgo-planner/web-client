import React from 'react';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { DialogComponentProps } from '../../../../types';

type Props = Omit<DialogComponentProps, 'keepMounted' | 'onExited' | 'PaperProps'>;

const Title = 'Override Changes?';

// eslint-disable-next-line max-len
const Prompt = 'External changes to the user data have been detected. Are you sure you want to proceed with saving? This may override the changes.';

export const RouteDataEditSaveOnStaleDataDialog = React.memo((props: Props) => (
    <PromptDialog
        {...props}
        keepMounted={false}
        title={Title}
        prompt={Prompt}
        cancelButtonColor='secondary'
        confirmButtonColor='primary'
        confirmButtonLabel='Save'
    />
));
