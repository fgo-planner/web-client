export enum MasterServantImportExistingAction {

    /**
     * The imported servants will be appended to the existing servant list.
     */
    Append = 'Append',

    /**
     * Any servants that already exist will be updated, and any new servant will be
     * added. Servants will be matched by `id` to determine if they already exists.
     * In the case of duplicate servants, they will be matched by their order of
     * appearance (index).
     */
    Update = 'Update',

    /**
     * The existing servant list will be wiped and replaced by the imported
     * servants.
     */
    Overwrite = 'Overwrite'

}