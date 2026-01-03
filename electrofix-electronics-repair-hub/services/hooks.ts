import { useState, useEffect } from 'react';
import { AppState } from '../types';
import { getAppState, subscribe } from './storage';

export const useAppState = (): AppState => {
    const [state, setState] = useState<AppState>(getAppState());

    useEffect(() => {
        const unsubscribe = subscribe(() => {
            setState({ ...getAppState() }); // Spread to ensure new reference
        });
        return unsubscribe;
    }, []);

    return state;
};
