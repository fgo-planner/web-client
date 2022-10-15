import { Nullable } from '@fgo-planner/common-core';
import { ImmutableBasicMasterAccount } from '@fgo-planner/data-core';
import { MasterAccountUtils } from '../../../utils/master/master-account.utils';

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

    return <>{MasterAccountUtils.formatFriendId(masterAccount, defaultValue)}</>;
};
