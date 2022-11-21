export enum EditDialogAction {
    Add = 'add',
    Edit = 'edit'
}

export type EditDialogData<T> = Readonly<{
    action: EditDialogAction;
    data: T;
}>;
