import { ImmutableMasterServant } from '@fgo-planner/data-core';
import { IconOutlined } from '../../../../../../components/icons/IconOutlined';
import { AssetConstants } from '../../../../../../constants';

type Props = {
    masterServant: ImmutableMasterServant;
};

export const StyleClassPrefix = 'MasterServantListRowNpLevel';

/**
 * Wrapping this component in React.memo is unnecessary since the
 * `masterServant` prop will always change when changes are made to a servant. 
 */
/** 
 *
 */
export const MasterServantListRowNpLevel = ({ masterServant }: Props) => {

    const {
        summoned,
        np: npLevel
    } = masterServant;

    if (!summoned) {
        return (
            <div className={`${StyleClassPrefix}-root`}>
                <IconOutlined color='disabled'>person_off</IconOutlined>
            </div>
        );
    }

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <img src={AssetConstants.ServantNoblePhantasmIconSmallUrl} alt='Noble Phantasm' />
            <div>
                {npLevel}
            </div>
        </div>
    );

};
