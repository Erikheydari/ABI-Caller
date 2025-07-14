<script setup>
import { ref, computed } from 'vue';
import InputField from './InputField.vue';
import Button from './Button.vue';
import { useMethodManager } from '@/composables/useMethodManager.js';
import { useContractCaller } from '@/composables/useContractCaller.js';

// Props
const props = defineProps({
  method: {
    type: Object,
    required: true
  },
  contractAddress: {
    type: String,
    required: true
  },
  abiContent: {
    type: String,
    required: true
  },
  rpcUrl: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  }
});

// Local state for this method
const isExpanded = ref(false);
const methodInputs = ref({});
const inputModes = ref({}); // Track input mode for each uint256 input (true = human readable, false = raw)

// Initialize method manager composable
const { checkIsWriteable } = useMethodManager();

// Initialize contract caller composable for this specific method
const {
  isLoading: isCallingContract,
  result: contractResult,
  txHash: contractTxHash,
  error: contractError,
  callMethod,
  clearResults
} = useContractCaller();

// Toggle method expansion for parameter input
const toggleExpansion = () => {
  isExpanded.value = !isExpanded.value;
};

// Method input helpers
const getInputValue = (inputIndex) => {
  return methodInputs.value[inputIndex] || '';
};

const setInputValue = (inputIndex, value) => {
  methodInputs.value[inputIndex] = value;
};

// Input mode helpers
const isUint256Input = (inputType) => {
  return inputType === 'uint256' || inputType.startsWith('uint256');
};

const getInputMode = (inputIndex) => {
  return inputModes.value[inputIndex] ?? true; // Default to human readable mode
};

const toggleInputMode = (inputIndex) => {
  const currentMode = getInputMode(inputIndex);
  inputModes.value[inputIndex] = !currentMode;

  // Clear the input when switching modes to avoid confusion
  methodInputs.value[inputIndex] = '';
};

const convertToUint256 = (humanValue, decimals = 18) => {
  try {
    if (!humanValue || humanValue === '') return '';

    const num = parseFloat(humanValue);
    if (isNaN(num)) return '';

    // Convert to wei/smallest unit
    const multiplier = Math.pow(10, decimals);
    const result = (num * multiplier).toString();

    // Handle very large numbers that might lose precision
    if (result.includes('e')) {
      // Use BigInt for large numbers
      const [base, exp] = result.split('e+');
      const baseNum = parseFloat(base);
      const expNum = parseInt(exp);
      const totalDecimals = decimals + expNum - (base.split('.')[1]?.length || 0);
      return (baseNum * Math.pow(10, totalDecimals)).toFixed(0);
    }

    return result.split('.')[0]; // Remove any decimal part
  } catch (error) {
    console.error('Conversion error:', error);
    return '';
  }
};

const getDisplayValue = (inputIndex, inputType) => {
  const value = getInputValue(inputIndex);
  const isHumanMode = getInputMode(inputIndex);

  if (!isUint256Input(inputType)) {
    return value;
  }

  return value;
};

const getPlaceholder = (input) => {
  if (!isUint256Input(input.type)) {
    return `Enter ${input.type} value`;
  }

  const inputIndex = props.method.inputs.indexOf(input);
  const isHumanMode = getInputMode(inputIndex);

  if (isHumanMode) {
    return `Enter decimal amount (e.g., 1.5)`;
  } else {
    return `Enter raw uint256 value (e.g., 1500000000000000000)`;
  }
};

// Handle method call
const handleMethodCall = async () => {
  try {
    // Process inputs and convert human readable uint256 values
    const processedArgs = {};

    for (const [index, input] of props.method.inputs.entries()) {
      const rawValue = methodInputs.value[index] || '';

      if (isUint256Input(input.type) && getInputMode(index)) {
        // Convert human readable to uint256
        processedArgs[index] = convertToUint256(rawValue);
      } else {
        // Use raw value
        processedArgs[index] = rawValue;
      }
    }

    // Call the contract method
    await callMethod({
      method: props.method,
      contractAddress: props.contractAddress,
      abi: props.abiContent,
      rpcUrl: props.rpcUrl,
      privateKey: props.privateKey,
      args: processedArgs
    });
  } catch (error) {
    console.error('Method call failed:', error);
    alert(`Method call failed: ${error.message}`);
  }
};

// Computed property to check if method is writeable
const isWriteable = computed(() => {
  return checkIsWriteable(props.method.stateMutability, props.method.type);
});

// Computed property to check if there are any results to show
const hasResults = computed(() => {
  return contractResult.value || contractError.value || contractTxHash.value;
});
</script>

<template>
  <div class="method-item">
    <div class="method-item-header" :style="isExpanded ? 'margin-bottom: 0;' : ''">
      <div class="method-item-header-left">
        <span class="subtitle-text">{{ method.name }}</span>
        <span class="method-type">
          {{ isWriteable ? 'Writeable' : 'Readonly' }}
        </span>
      </div>

      <div class="method-actions">
        <Button v-if="method.inputs && method.inputs.length > 0" @click="toggleExpansion" size="small">
          {{ isExpanded ? 'Hide Inputs' : 'Show Inputs' }}
        </Button>
        <Button @click="handleMethodCall" :disabled="isCallingContract" size="small">
          {{ isCallingContract ? 'Calling...' : 'Call' }}
        </Button>
      </div>
    </div>

    <div class="method-item-content">

      <!-- Method Outputs Info -->
      <div v-if="method.outputs && method.outputs.length > 0" class="method-outputs-info">
        <h4 class="method-sub-title">Expected Outputs:</h4>
        <div v-for="(output, index) in method.outputs" :key="index" class="method-output-info">
          <span class="output-info">{{ output.name || `output${index}` }} ({{ output.type }})</span>
        </div>
      </div>

      <!-- Method Parameters -->
      <div v-if="isExpanded && method.inputs && method.inputs.length > 0" class="method-inputs-wrapper">
        <h4 class="method-sub-title">Inputs</h4>
        <div class="method-inputs">
          <div v-for="(input, index) in method.inputs" :key="index" class="method-input">
            <div class="input-container">
              <div class="input-header">
                <span class="input-label">{{ input.name }} ({{ input.type }})</span>
                <Button v-if="isUint256Input(input.type)" @click="toggleInputMode(index)" size="small"
                  variant="secondary" class="mode-toggle">
                  {{ getInputMode(index) ? 'Raw Mode' : 'Decimal Mode' }}
                </Button>
              </div>

              <InputField label="" :placeholder="getPlaceholder(input)"
                :model-value="getDisplayValue(index, input.type)"
                @update:model-value="(value) => setInputValue(index, value)" />

              <!-- Show conversion preview for uint256 in human mode -->
              <div v-if="isUint256Input(input.type) && getInputMode(index) && getInputValue(index)"
                class="conversion-preview">
                <span class="preview-label">Raw value:</span>
                <code class="preview-value">{{ convertToUint256(getInputValue(index)) }}</code>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Method Results -->
      <div v-if="hasResults" class="method-results">
        <div class="results-header">
          <h4 class="method-sub-title">Results</h4>
          <Button @click="clearResults" size="small" variant="secondary">Clear</Button>
        </div>

        <!-- Transaction Hash -->
        <div v-if="contractTxHash" class="result-section">
          <h5 class="result-label">Transaction Hash</h5>
          <div class="result-content">
            <code>{{ contractTxHash }}</code>
          </div>
        </div>

        <!-- Result -->
        <div v-if="contractResult" class="result-section">
          <h5 class="result-label">Success</h5>
          <div class="result-content">
            <pre>{{ contractResult }}</pre>
          </div>
        </div>

        <!-- Error -->
        <div v-if="contractError" class="result-section error">
          <h5 class="result-label">Error</h5>
          <div class="result-content">
            <span class="error-text">{{ contractError }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.method-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background-color: var(--background-muted);
}

.method-item-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem;
  width: 100%;
  margin-bottom: 1rem;
  align-items: center;
  background-color: var(--color-background-soft);
}

.method-item-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  padding-top: 0;
}

.method-item-header-left {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.method-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.method-inputs-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: start;
}

.method-inputs {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  width: 100%;
  align-items: end;
}

.method-input {
  width: 100%;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.mode-toggle {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.conversion-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.preview-label {
  color: var(--text-muted);
  font-weight: 500;
}

.preview-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: var(--text);
  background-color: var(--background-muted);
  padding: 0.25rem;
  border-radius: 0.125rem;
  word-break: break-all;
}

.method-outputs-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid var(--border);
}

.method-sub-title {
  font-size: .95rem;
  font-weight: 600;
  color: var(--text-muted);
  text-wrap: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.method-sub-title:after {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background-color: var(--color-background-mute);
  margin: 0 1rem;
}

.method-output-info {
  display: flex;
  align-items: center;
}

.output-info {
  font-size: 0.875rem;
  color: var(--text-muted);
  background-color: var(--background);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--border);
}

.method-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-top: 2px solid var(--border);
  background-color: var(--background);
  border-radius: 0.375rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem
}

.result-section:not(.error) {
  border-left: 4px solid var(--success);
  background-color: var(--success-muted);
  padding-left: 1rem;
}

.result-section.error {
  border-left: 4px solid var(--error);
  background-color: var(--error-muted);
  padding-left: 1rem;
}

.result-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
}

.result-content {
  background-color: var(--background-muted);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}

.result-content code {
  word-break: break-all;
}

.result-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.method-type {
  font-size: 0.875rem;
  color: var(--text-muted);
  background-color: var(--background);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--border);
}
</style>