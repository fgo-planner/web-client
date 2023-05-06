export type SelectedData<T, ID> = {
    ids: ReadonlySet<ID>;
    instances: ReadonlyArray<T>
};
