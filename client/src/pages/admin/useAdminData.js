import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api';

// Fetches an admin endpoint and exposes a reload function for after mutations.
export default function useAdminData(path) {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const reload = useCallback(() => {
        setError('');
        return api(path)
            .then(setData)
            .catch((err) => setError(err.message));
    }, [path]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { data, error, reload };
}
