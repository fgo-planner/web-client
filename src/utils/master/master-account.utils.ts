import { ImmutableBasicMasterAccount } from '@fgo-planner/data-core';


function formatFriendId({ friendId }: ImmutableBasicMasterAccount, defaultValue = ''): string {
    if (!friendId) {
        return defaultValue;
    }
    return friendId.substring(0, 3) + ',' + friendId.substring(3, 6) + ',' + friendId.substring(6, 9);
}
export const MasterAccountUtils = { 
    formatFriendId
};
