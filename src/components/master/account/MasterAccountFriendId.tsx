import { Immutable, Nullable } from '@fgo-planner/common-core';
import { BasicMasterAccount } from '@fgo-planner/data-core';
import { NumberFormatUtils } from '../../../utils/format/NumberFormatUtils';

type Props = {
    defaultValue?: string;
    masterAccount: Nullable<Immutable<BasicMasterAccount>>;
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
