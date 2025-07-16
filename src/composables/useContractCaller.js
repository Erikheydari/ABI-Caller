import { ref, computed } from 'vue'
import { ethers } from 'ethers'

export function useContractCaller() {
    // Reactive state
    const isLoading = ref(false)
    const result = ref('')
    const txHash = ref(null)
    const error = ref('')
    const methodArgs = ref({})

    // Clear previous results
    const clearResults = () => {
        result.value = ''
        txHash.value = null
        error.value = ''
    }

    // Parse method arguments based on input types
    const parseMethodArgs = (method, args) => {
        if (!method.inputs || method.inputs.length === 0) {
            return []
        }

        return method.inputs.map((input, index) => {
            const value = args[index]
            if (!value && value !== 0 && value !== false) {
                return input.type.endsWith('[]') ? [] : ''
            }

            // Handle array types
            if (input.type.endsWith('[]') && typeof value === 'string') {
                return value.split(',').map(x => x.trim())
            }

            // Handle different types
            if (input.type.startsWith('uint') || input.type.startsWith('int')) {
                return value
            }

            if (input.type === 'bool') {
                return Boolean(value)
            }

            return value
        })
    }

    // Call contract method
    const callMethod = async (params) => {
        const {
            method,
            contractAddress,
            abi,
            rpcUrl,
            privateKey,
            args = {},
            gasPrice,
            gasLimit,
            value: txValue
        } = params

        clearResults()
        isLoading.value = true

        try {
            // Validate required parameters
            if (!contractAddress) {
                throw new Error('Contract address is required')
            }
            if (!rpcUrl) {
                throw new Error('RPC URL is required')
            }
            if (!abi) {
                throw new Error('ABI is required')
            }

            // Create provider
            const provider = new ethers.JsonRpcProvider(rpcUrl)

            // Create signer (if private key provided)
            let signer = provider
            if (privateKey && privateKey !== '0xff') {
                const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
                signer = new ethers.Wallet(cleanPrivateKey, provider)
            }

            // Parse ABI if it's a string
            const parsedAbi = typeof abi === 'string' ? JSON.parse(abi) : abi

            // Create contract instance
            const contract = new ethers.Contract(contractAddress, parsedAbi, signer)

            // Parse method arguments
            const methodArgs = parseMethodArgs(method, Object.values(args))
            console.log('Method args:', methodArgs)

            // Prepare transaction options
            const txOpts = {}
            if (gasPrice) txOpts.gasPrice = ethers.parseUnits(gasPrice.toString(), 'gwei')
            if (gasLimit) txOpts.gasLimit = gasLimit
            if (txValue) txOpts.value = ethers.parseEther(txValue.toString())

            // Determine if this is a read or write operation
            const isReadOnly = !['nonpayable', 'payable'].includes(method.stateMutability)

            let res
            if (isReadOnly) {
                // For read operations, use the contract directly
                res = await contract[method.name](...methodArgs)
            } else {
                // For write operations, call the function with transaction options
                res = await contract[method.name](...methodArgs, txOpts)
                txHash.value = res.hash
                // Wait for transaction receipt for write operations
                await res.wait()
            }

            console.log('Contract call result:', res)

            // Format result for display
            if (typeof res === 'object' && res !== null) {
                if (res.hash) {
                    // This is a transaction response
                    result.value = JSON.stringify({
                        hash: res.hash,
                        from: res.from,
                        to: res.to,
                        value: res.value ? ethers.formatEther(res.value) : '0',
                        gasLimit: res.gasLimit ? res.gasLimit.toString() : '',
                        gasPrice: res.gasPrice ? ethers.formatUnits(res.gasPrice, 'gwei') : ''
                    }, null, 2)
                } else {
                    // This is a call result
                    result.value = JSON.stringify(res, (key, value) =>
                        typeof value === 'bigint' ? value.toString() : value
                        , 2)
                }
            } else {
                result.value = res.toString()
            }

        } catch (err) {
            console.error('Contract call error:', err)
            error.value = err.message || 'Unknown error occurred'
        } finally {
            isLoading.value = false
        }
    }

    // Set method arguments
    const setMethodArgs = (methodName, args) => {
        methodArgs.value[methodName] = args
    }

    // Get method arguments
    const getMethodArgs = (methodName) => {
        return methodArgs.value[methodName] || {}
    }

    return {
        // State
        isLoading,
        result,
        txHash,
        error,
        methodArgs,

        // Methods
        callMethod,
        setMethodArgs,
        getMethodArgs,
        clearResults
    }
} 