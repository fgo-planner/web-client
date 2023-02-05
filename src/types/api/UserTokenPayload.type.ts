/**
 * User access token contents.
 */
export type UserTokenPayload = {
    id: string;
    username: string;
    email: string;
    admin?: boolean;
};
