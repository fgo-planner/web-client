import { CircularProgress } from '@mui/material';
import React, { CSSProperties, useMemo } from 'react';
import { useActiveBreakpoints } from '../../hooks/user-interface/use-active-breakpoints.hook';

type Props = {
    visible?: boolean;
    zIndex?: number;
};

const CircularProgressThickness = 3.7;

/**
 * MuiDialogs are 1300 by default, the loading indicator should be rendered
 * above dialogs in most cases.
 */
const DefaultZIndex = 1337;

const styles = {
    root: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0
    } as CSSProperties,
    progressContainer: {
        paddingTop: '25vh'
    } as CSSProperties
};

// TODO Un-hardcode values

export const LoadingIndicator = React.memo(({ visible, zIndex }: Props) => {

    // TODO Move these to sx prop
    const { sm, md } = useActiveBreakpoints();
    const indicatorSize = md ? 160 : sm ? 150 : 120;

    const rootStyle = useMemo(() => ({
        ...styles.root,
        zIndex: zIndex ?? DefaultZIndex
    }), [zIndex]);
    
    if (visible === false) {
        return null;
    }

    return (
        <div className='backdrop-blur' style={rootStyle}>
            <div style={styles.progressContainer}>
                <CircularProgress size={indicatorSize} thickness={CircularProgressThickness} />
            </div>
        </div>
    );
    
});
