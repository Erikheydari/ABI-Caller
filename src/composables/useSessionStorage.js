import { ref, watch, nextTick } from 'vue';

export function useSessionStorage() {
    // Session storage keys
    const STORAGE_KEYS = {
        rpcUrl: 'abiCaller_rpcUrl',
        useCustomRpcUrl: 'abiCaller_useCustomRpcUrl',
        address: 'abiCaller_address',
        privateKey: 'abiCaller_privateKey',
        contractAddress: 'abiCaller_contractAddress',
        useConnectWallet: 'abiCaller_useConnectWallet',
        useCustomAbi: 'abiCaller_useCustomAbi',
        selectedAbi: 'abiCaller_selectedAbi',
        abiContent: 'abiCaller_abiContent',
        customAbiName: 'abiCaller_customAbiName',
        showPassword: 'abiCaller_showPassword'
    };

    // Helper functions for session storage
    const saveToSession = (key, value) => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Failed to save ${key} to session storage:`, error);
        }
    };

    const loadFromSession = (key, defaultValue = null) => {
        try {
            const stored = sessionStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.warn(`Failed to load ${key} from session storage:`, error);
            return defaultValue;
        }
    };

    const removeFromSession = (key) => {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.warn(`Failed to remove ${key} from session storage:`, error);
        }
    };

    // Create reactive refs for all form values
    const sessionData = {
        rpcUrl: ref(''),
        useCustomRpcUrl: ref(false),
        address: ref(''),
        privateKey: ref('0xff'),
        contractAddress: ref(''),
        useConnectWallet: ref(false),
        useCustomAbi: ref(false),
        selectedAbi: ref(''),
        abiContent: ref(''),
        customAbiName: ref(''),
        showPassword: ref(false)
    };

    // Set up watchers to automatically save changes to session storage
    const setupWatchers = () => {
        Object.keys(sessionData).forEach(key => {
            watch(sessionData[key], (newValue) => {
                saveToSession(STORAGE_KEYS[key], newValue);
            }, { deep: true });
        });
    };

    // Load initial values from session storage
    const loadFromSessionStorage = () => {
        Object.keys(sessionData).forEach(key => {
            const storedValue = loadFromSession(STORAGE_KEYS[key]);
            if (storedValue !== null) {
                sessionData[key].value = storedValue;
            }
        });
    };

    // Clear all session storage and reset form values
    const clearSessionStorage = () => {
        Object.keys(STORAGE_KEYS).forEach(key => {
            removeFromSession(STORAGE_KEYS[key]);
        });
        
        // Reset all values to defaults
        sessionData.rpcUrl.value = '';
        sessionData.useCustomRpcUrl.value = false;
        sessionData.address.value = '';
        sessionData.privateKey.value = '0xff';
        sessionData.contractAddress.value = '';
        sessionData.useConnectWallet.value = false;
        sessionData.useCustomAbi.value = false;
        sessionData.selectedAbi.value = '';
        sessionData.abiContent.value = '';
        sessionData.customAbiName.value = '';
        sessionData.showPassword.value = false;
    };

    // Check if session storage has any saved data
    const hasSessionData = () => {
        return Object.values(STORAGE_KEYS).some(key => {
            return sessionStorage.getItem(key) !== null;
        });
    };

    // Initialize session storage functionality
    const initializeSessionStorage = () => {
        loadFromSessionStorage();
        setupWatchers();
    };

    return {
        // Session data refs
        ...sessionData,
        
        // Methods
        initializeSessionStorage,
        clearSessionStorage,
        hasSessionData,
        saveToSession,
        loadFromSession
    };
} 