import { Immutable } from '@fgo-planner/common-core';
import { MasterServant } from '@fgo-planner/data-core';
import { AssetConstants } from '../../../../../../constants';

type Props = {
    masterServant: Immutable<MasterServant>;
};

export const StyleClassPrefix = 'MasterServantListRowLevel';

/**
 * Wrapping this component in React.memo is unnecessary since the
 * `masterServant` prop will always change when changes are made to a servant. 
 */
/** 
 *
 */
export const MasterServantListRowLevel = ({ masterServant }: Props) => {

    const {
        ascension,
        level
    } = masterServant;

    const iconUrl = ascension ? AssetConstants.ServantAscensionOnIcon : AssetConstants.ServantAscensionOffIcon;

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <div className='value'>
                {level}
            </div>
            <img src={iconUrl} alt='Ascension' />
            <div className='ascension'>
                {ascension}
            </div>
            {/* TODO Add grail icon */}
        </div>
    );

};
