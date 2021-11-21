import { CircularProgress, Theme, useMediaQuery } from '@mui/material';
import React, { CSSProperties, useMemo } from 'react';

type Props = {
    visible?: boolean;
    zIndex?: number;
};

const CircularProgressThickness = 3.7;

const styles = {
    root: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0
    } as CSSProperties,
    progressContainer: {
        paddingTop: '25vh'
    } as CSSProperties
};

export const LoadingIndicator = React.memo(({ visible, zIndex }: Props) => {

    // TODO Change this to use useActiveBreakpoints hook instead.
    const breakpointSm = useMediaQuery((theme: Theme) => theme.breakpoints.only('sm'));
    const breakpointXs = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'));
    const indicatorSize = breakpointXs ? 120 : breakpointSm ? 150 : 160;
    
    const rootStyle = useMemo(() => ({
        ...styles.root,
        zIndex: zIndex ?? 1
    }), [zIndex]);
    
    if (visible === false) {
        return null;
    }

    return (
        <div className="backdrop-blur" style={rootStyle}>
            <div style={styles.progressContainer}>
                <CircularProgress size={indicatorSize} thickness={CircularProgressThickness} />
            </div>
        </div>
    );
    
});
