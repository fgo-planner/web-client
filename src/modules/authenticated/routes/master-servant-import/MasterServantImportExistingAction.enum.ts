
const Append = 'Append';
const Update = 'Update';
const Overwrite = 'Overwrite';

export type MasterServantImportExistingAction =
    typeof Append |
    typeof Update |
    typeof Overwrite;

export const MasterServantImportExistingAction = {

    /**
     * The imported servants will be appended to the existing servant list.
     */
    Append,

    /**
     * Any servants that already exist will be updated, and any new servant will be
     * added. Servants will be matched by `id` to determine if they already exists.
     * In the case of duplicate servants, they will be matched by their order of
     * appearance (index).
     */
    Update,

    /**
     * The existing servant list will be wiped and replaced by the imported
     * servants.
     */
    Overwrite

} as const;
