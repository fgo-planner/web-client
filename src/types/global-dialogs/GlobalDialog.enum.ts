const Login = 0;
const NavigationBlocker = 1;

export type GlobalDialog =
    typeof Login |
    typeof NavigationBlocker;

export const GlobalDialog = {
    Login,
    NavigationBlocker
} as const;
