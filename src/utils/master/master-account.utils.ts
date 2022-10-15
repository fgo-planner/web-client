import { ImmutableBasicMasterAccount } from '@fgo-planner/data-core';
import { NumericFormatProps, numericFormatter } from 'react-number-format';

const FriendIdFormatProps: NumericFormatProps = {
    thousandSeparator: true
};

function formatFriendId({ friendId }: ImmutableBasicMasterAccount, defaultValue = ''): string {
    if (!friendId) {
        return defaultValue;
    }
    return numericFormatter(friendId, FriendIdFormatProps);
}

export const MasterAccountUtils = { 
    formatFriendId
};
