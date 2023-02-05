
const AppBarElevate = 'AppBarElevate';
const LoadingIndicator = 'LoadingIndicator';
const NavigationDrawerNoAnimations = 'NavigationDrawerNoAnimations';

export type LockableUIFeature =
    typeof AppBarElevate |
    typeof LoadingIndicator |
    typeof NavigationDrawerNoAnimations;

export const LockableUIFeature = {
    AppBarElevate,
    LoadingIndicator,
    NavigationDrawerNoAnimations
} as const;
