import { Entity } from '../entity.type';

export type User = Entity<string> & {

    username: string;

    hash?: string;

    email?: string;

    admin?: boolean;

    enabled: boolean;
    
};
