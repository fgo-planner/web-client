/**
 * DTO for use with MUI's Autocomplete component.
 * 
 * The `label` property is a special case for MUI's Autocomplete component. The
 * built in `getOptionLabel` function will attempt to retrieve from the `label`
 * property for non-string option objects. If the property is not present, then
 * a custom function will have to be provided.
 *
 * @see https://github.com/mui/material-ui/blob/547b76032b890d623e3b778c3fffc7b8a924c46b/packages/mui-material/src/Autocomplete/Autocomplete.js#L394
 */
export type AutocompleteOptionWithLabel<T> = Readonly<{
    label: string;
    data: T;
}>;
