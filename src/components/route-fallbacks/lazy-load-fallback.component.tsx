import React, { PureComponent, ReactNode } from 'react';

/**
 * A fallback component that is rendered by default during lazy loading.
 */
export class LazyLoadFallback extends PureComponent {

    render(): ReactNode {
        return <div>Loading...</div>;
    }

}
