import { ref, watch } from 'vue'
import { ethers } from 'ethers'

export function useWalletGenerator(onAddressGenerated) {
    // Reactive state
    const generatedPrivateKey = ref('')
    const generatedAddress = ref('')
    const inputPrivateKey = ref('')
    const derivedAddress = ref('')
    const error = ref('')

    // Generate random private key and address
    const generateRandomWallet = () => {
        try {
            const wallet = ethers.Wallet.createRandom()
            generatedPrivateKey.value = wallet.privateKey
            generatedAddress.value = wallet.address
            error.value = ''

            if (onAddressGenerated) {
                onAddressGenerated(wallet.address, wallet.privateKey)
            }
        } catch (err) {
            error.value = err.message
        }
    }

    // Derive address from private key
    const deriveAddressFromPrivateKey = (privateKey) => {
        try {
            if (!privateKey) {
                derivedAddress.value = ''
                return
            }

            const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
            const wallet = new ethers.Wallet(cleanPrivateKey)
            derivedAddress.value = wallet.address
            error.value = ''

            if (onAddressGenerated) {
                onAddressGenerated(wallet.address, cleanPrivateKey)
            }
        } catch (err) {
            error.value = 'Invalid private key'
            derivedAddress.value = ''
        }
    }

    // Copy to clipboard functionality
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            // You can replace this with a toast notification if you have one
            alert('Copied to clipboard!')
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    // Watch for input private key changes with debouncing
    let debounceTimeout
    watch(inputPrivateKey, (newValue) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout)
        }

        if (newValue) {
            debounceTimeout = setTimeout(() => {
                deriveAddressFromPrivateKey(newValue.trim())
            }, 500) // Debounce for 500ms
        } else {
            derivedAddress.value = ''
            error.value = ''
        }
    })

    // Handle input change (for manual triggering if needed)
    const handleInputChange = (value) => {
        inputPrivateKey.value = value.trim()
    }

    return {
        // State
        generatedPrivateKey,
        generatedAddress,
        inputPrivateKey,
        derivedAddress,
        error,

        // Methods
        generateRandomWallet,
        deriveAddressFromPrivateKey,
        handleInputChange,
        copyToClipboard
    }
} 