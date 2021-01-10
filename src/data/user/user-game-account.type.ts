import { Entity } from '../entity.type';
import { UserGameAccountItem } from './user-game-account-item.type';
import { UserGameAccountServant } from './user-game-account-servant.type';

export type UserGameAccount = Entity<string> & {

    userId: string;

    /**
     * Account nickname.
     */
    name?: string;

    friendId?: string;

    exp?: number;

    qp: number;

    items: UserGameAccountItem[];

    servants: UserGameAccountServant[];

}
