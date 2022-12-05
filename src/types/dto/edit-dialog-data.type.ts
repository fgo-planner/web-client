export enum EditDialogAction {
    Add = 'add',
    Edit = 'edit'
}

// TODO Maybe rename this
export type EditDialogData<T> = Readonly<{
    action: EditDialogAction;
    data: T;
}>;
