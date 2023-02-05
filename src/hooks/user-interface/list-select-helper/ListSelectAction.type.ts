/**
 * The action to perform on the selection. Possible values:
 *
 * - `override`: Overrides the entire selection with the target (only the target
 *   will be selected after the action is performed).
 *
 * - `continuous`: Selects all the items between the previous action target and
 *   the current target. Behaves like `override` if multiple select is disabled.
 *
 * - `invert-target`: If the target is not selected, then adds it to the
 *   selection (behaves like `override` if multiple select is disabled,
 *   otherwise the rest of the selection is unchanged). Otherwise deselects it. 
 *
 * - `append-target`: If the target is not selected, then adds it to the
 *   selection. Behaves like `override` if multiple select is disabled,
 *   otherwise the rest of the selection is unchanged.
 */
export type ListSelectAction =
    'override' |
    'continuous' |
    'invert-target' |
    'append-target';