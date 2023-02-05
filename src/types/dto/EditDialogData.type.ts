import { EditDialogAction } from './EditDialogAction.enum';

// TODO Maybe rename this
export type EditDialogData<T> = Readonly<{
    action: EditDialogAction;
    data: T;
}>;
