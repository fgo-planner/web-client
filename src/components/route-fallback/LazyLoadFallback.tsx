import React from 'react';
import { LoadingIndicator } from '../utils/LoadingIndicator';

/**
 * A fallback component that is rendered by default during lazy loading.
 */
export const LazyLoadFallback = React.memo(() => <LoadingIndicator />);
