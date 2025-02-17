import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLogout } from '../store';

const AuthWatcher = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.token);

    useEffect(() => {
        if (!token) return;

        const payload = JSON.parse(atob(token.split('.')[1])); // Decode token
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const timeLeft = expirationTime - Date.now();

        const timer = setTimeout(() => {
            dispatch(setLogout()); // Log out when token expires
            alert('Session expired. Please log in again.');
        }, timeLeft);

        return () => clearTimeout(timer); // Cleanup on unmount
    }, [token, dispatch]);

    return null; // This component doesn't render anything
};

export default AuthWatcher;