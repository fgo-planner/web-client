const Add = 'add';
const Edit = 'edit';

export type EditDialogAction = typeof Add | typeof Edit;

export const EditDialogAction = {
    Add,
    Edit
} as const;
