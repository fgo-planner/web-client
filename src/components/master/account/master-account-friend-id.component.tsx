import { Nullable } from '@fgo-planner/common-core';
import { ImmutableBasicMasterAccount } from '@fgo-planner/data-core';
import { NumberFormatUtils } from '../../../utils/format/number-format-utils';

type Props = {
    defaultValue?: string;
    masterAccount: Nullable<ImmutableBasicMasterAccount>;
};

/**
 * Wrapping this component in React.memo is unnecessary since it is a very basic
 * component.
 */
/** */
export const MasterAccountFriendId: React.FC<Props> = (props: Props) => {
    
    const {
        defaultValue,
        masterAccount
    } = props;

    if (!masterAccount) {
        return <>{defaultValue}</>;
    }

    return <>{NumberFormatUtils.formatFriendId(masterAccount.friendId, defaultValue)}</>;
};
