import { Icon as MuiIcon, IconProps } from '@mui/material';
import { MaterialIconVariant } from '../../types';
import { IconOutlined } from './IconOutlined';
import { IconRounded } from './IconRounded';
import { IconSharp } from './IconSharp';
import { IconTwoTone } from './IconTwoTone';

type Props = IconProps & {
    variant?: MaterialIconVariant;
};

/**
 * Wrapper for MUI's `Icon` component that automatically applies the style class
 * for the given variant.
 */
export const Icon: React.FC<Props> = (props: Props): JSX.Element => {

    const {
        variant,
        ...iconProps
    } = props;

    let IconComponent: React.FC<IconProps>;

    switch (variant) {
        case 'outlined':
            IconComponent = IconOutlined;
            break;
        case 'rounded':
            IconComponent = IconRounded;
            break;
        case 'sharp':
            IconComponent = IconSharp;
            break;
        case 'two-tone':
            IconComponent = IconTwoTone;
            break;
        default:
            IconComponent = MuiIcon;
    }

    return <IconComponent {...iconProps} />;

};
