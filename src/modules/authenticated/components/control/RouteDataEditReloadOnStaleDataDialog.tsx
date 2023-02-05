import React from 'react';
import { PromptDialog } from '../../../../components/dialog/PromptDialog';
import { DialogComponentProps } from '../../../../types';

type Props = Omit<DialogComponentProps, 'keepMounted' | 'onExited' | 'PaperProps'>;

const Title = 'Sync Data?';

// eslint-disable-next-line max-len
const Prompt = 'Are you sure you want to do a data sync? This will reload the latest user data, but any unsaved changes will be discarded.';

export const RouteDataEditReloadOnStaleDataDialog = React.memo((props: Props) => (
    <PromptDialog
        {...props}
        keepMounted={false}
        title={Title}
        prompt={Prompt}
        cancelButtonColor='secondary'
        confirmButtonColor='primary'
    />
));
