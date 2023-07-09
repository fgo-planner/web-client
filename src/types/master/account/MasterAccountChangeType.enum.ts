const None = 'None';
const Created = 'Created';
const Updated = 'Updated';
const Deleted = 'Deleted';

export type MasterAccountChangeType =
    typeof None |
    typeof Created |
    typeof Updated |
    typeof Deleted;

export const MasterAccountChangeType = {
    None,
    Created,
    Updated,
    Deleted
} as const;
