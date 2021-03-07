import { grey } from '@material-ui/core/colors';
import { Overrides as CoreOverrides } from '@material-ui/core/styles/overrides';
import { SpeedDialActionClassKey } from '@material-ui/lab';
import { CSSProperties } from '@material-ui/styles';
import { ThemeConstants } from './theme-constants';

type Override<T extends string> = Partial<Record<T, CSSProperties | (() => CSSProperties)>>;

type Overrides = {
    MuiSpeedDialAction?: Override<SpeedDialActionClassKey>;
} & CoreOverrides;

const spacing = (scale: number) => {
    return `${ThemeConstants.Spacing * scale}px`;
};

const overrides: Overrides = {
    MuiButton: {
        contained: {
            backgroundColor: grey[50]
        },
        label: {
            fontFamily: ThemeConstants.FontFamilyGoogleSans,
            letterSpacing: '0.25px',
            textTransform: 'none'
        }
    },
    MuiFab: {
        root: {
            backgroundColor: grey[50]
        }
    },
    MuiTextField: {
        root: {
            // margin: spacing(3)
        }
    },
    MuiSpeedDialAction: {
        fab: {
            color: 'initial',
            backgroundColor: grey[50],
            '&:hover': {
                backgroundColor: '#d5d5d5'
            }
        }
    },
    MuiTypography: {
        h6: {
            fontFamily: ThemeConstants.FontFamilyGoogleSans
        }
    }
};

export default overrides;
