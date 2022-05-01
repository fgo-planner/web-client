import { MasterServant } from '@fgo-planner/types';
import { PersonOffOutlined as PersonOffOutlinedIcon } from '@mui/icons-material';
import { AssetConstants } from '../../../../../../constants';
import { Immutable } from '../../../../../../types/internal';

type Props = {
    masterServant: Immutable<MasterServant>;
};

export const StyleClassPrefix = 'MasterServantListRowNpLevel';

/*
 * No need to wrap this component in React.memo since the `masterServant` prop
 * will always change when changes are made to a servant. 
 */

export const MasterServantListRowNpLevel = ({ masterServant }: Props) => {

    const {
        summoned,
        np: npLevel
    } = masterServant;

    if (!summoned) {
        return (
            <div className={`${StyleClassPrefix}-root`}>
                <PersonOffOutlinedIcon color='disabled' fontSize='small' />
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
