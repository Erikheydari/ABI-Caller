import { ref, computed } from 'vue';

export function useMethodManager() {

    const isWriteable = ref(false);
    const stateMutability = ref('');
    const type = ref('');
    const name = ref('');

    const setMethod = (methodObj) => {
        stateMutability.value = methodObj.stateMutability;
        type.value = methodObj.type;
        isWriteable.value = checkIsWriteable(methodObj.stateMutability, methodObj.type);
    }

    const checkIsWriteable = (stateMutability, type) => {
        isWriteable.value = ['nonpayable', 'payable'].includes(stateMutability) &&
            type === 'function'
        return isWriteable.value;
    }

    return {
        isWriteable,
        stateMutability,
        type,
        checkIsWriteable,
        setMethod
    }
}

