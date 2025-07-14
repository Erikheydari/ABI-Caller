<script setup>
import Wrapper from "@/components/Wrapper.vue";
import InputField from "@/components/InputField.vue";
import Checkbox from "@/components/Checkbox.vue";
import Select from "@/components/Select.vue";
import Button from "@/components/Button.vue";
import TextArea from "@/components/TextArea.vue";
import MethodItem from "@/components/MethodItem.vue";

import { ref, watch, onMounted, computed } from "vue";
import { useWalletGenerator } from "@/composables/useWalletGenerator.js";
import { useAbiManager } from "@/composables/useAbiManager.js";
import { useSessionStorage } from "@/composables/useSessionStorage.js";

import rpcUrlContent from "@/content/rpc-url.json";

const rpcUrlList = ref(rpcUrlContent);

// Initialize session storage composable
const {
  rpcUrl,
  useCustomRpcUrl,
  address,
  privateKey,
  contractAddress,
  useConnectWallet,
  useCustomAbi,
  selectedAbi: sessionSelectedAbi,
  abiContent: sessionAbiContent,
  customAbiName: sessionCustomAbiName,
  showPassword,
  initializeSessionStorage,
  clearSessionStorage,
  hasSessionData
} = useSessionStorage();

// Initialize ABI manager composable
const {
  abis,
  selectedAbi,
  abiContent,
  customAbiName,
  useCustomAbi: abiUseCustomAbi,
  activeAddNewAbi,
  abiNames,
  hasAbis,
  isDefaultAbi,
  addNewAbiToList,
  removeAbi,
  exportAbis,
  importAbis
} = useAbiManager();

// Sync session storage with ABI manager
watch(sessionSelectedAbi, (newValue) => {
  selectedAbi.value = newValue;
});
watch(selectedAbi, (newValue) => {
  sessionSelectedAbi.value = newValue;
});

watch(sessionAbiContent, (newValue) => {
  abiContent.value = newValue;
});
watch(abiContent, (newValue) => {
  sessionAbiContent.value = newValue;
});

watch(sessionCustomAbiName, (newValue) => {
  customAbiName.value = newValue;
});
watch(customAbiName, (newValue) => {
  sessionCustomAbiName.value = newValue;
});

// Initialize wallet generator composable
const {
  generatedPrivateKey,
  generatedAddress,
  derivedAddress,
  error: walletError,
  generateRandomWallet: generateWallet,
  deriveAddressFromPrivateKey,
  copyToClipboard
} = useWalletGenerator((generatedAddr, generatedPrivKey) => {
  console.log('Address generated:', generatedAddr, 'Private Key:', generatedPrivKey);
});



// Wrapper function to generate random wallet and update form
const generateRandomWallet = () => {
  generateWallet();
};

// Watch for generated private key and update form
watch(generatedPrivateKey, (newPrivateKey) => {
  if (newPrivateKey) {
    privateKey.value = newPrivateKey;
  }
});

// Watch for private key changes and automatically derive address
watch(privateKey, (newPrivateKey) => {
  if (newPrivateKey && newPrivateKey !== '0xff') {
    deriveAddressFromPrivateKey(newPrivateKey);
  } else {
    address.value = '';
  }
}, { immediate: true });

// Update address when derivedAddress changes
watch(derivedAddress, (newAddress) => {
  address.value = newAddress;
});

// Sync the local useCustomAbi with the composable's useCustomAbi
watch(useCustomAbi, (newValue) => {
  abiUseCustomAbi.value = newValue;
});

watch(abiUseCustomAbi, (newValue) => {
  useCustomAbi.value = newValue;
});

const addToList = () => {
  const result = addNewAbiToList();
  if (!result.success) {
    alert(result.message);
  }
};

const handleImportAbis = async (file) => {
  console.log('handleImportAbis called with file:', file);
  try {
    const result = await importAbis(file);
    console.log('Import result:', result);
    if (result.success) {
      alert(result.message);
    } else {
      alert(`Import failed: ${result.message}`);
    }
  } catch (error) {
    console.error('Import error:', error);
    alert('An unexpected error occurred during import');
  }
};

const triggerFileInput = () => {
  const fileInput = document.getElementById('import-file');
  if (fileInput) {
    fileInput.click();
  }
};



// Computed property to extract methods from ABI content
const abiMethods = computed(() => {
  if (!abiContent.value || !abiContent.value.trim()) {
    return [];
  }

  try {
    const parsedAbi = JSON.parse(abiContent.value);

    if (!Array.isArray(parsedAbi)) {
      return [];
    }

    // Filter only functions from the ABI
    return parsedAbi.filter(item =>
      item.type === 'function' &&
      item.name
    );
  } catch (error) {
    console.error('Error parsing ABI content:', error);
    return [];
  }
});

// Clear form and session storage
const clearForm = () => {
  if (confirm('Are you sure you want to clear all form data? This will remove all saved values from session storage.')) {
    clearSessionStorage();
    // Also reset ABI manager selections
    selectedAbi.value = '';
    abiContent.value = '';
    customAbiName.value = '';
  }
};

// Initialize session storage on component mount
onMounted(() => {
  initializeSessionStorage();
});

</script>

<template>
  <main class="main-container">
    <div class="header-container">
      <h1 class="title-text">
        ABI Caller
      </h1>
      <Button @click="clearForm" variant="secondary" class="clear-form-btn">
        Clear Form & Session Storage
      </Button>
    </div>

    <Wrapper title="Network Configuration">
      <p class="body-text">
        Configure the network settings for your application.
      </p>


      <div class="flex-column-wrapper w-full">
        <Checkbox v-model="useCustomRpcUrl" label="Use Custom RPC URL" />

        <Select label="Pre-configured RPC URLs" placeholder="Select a RPC URL" v-model="rpcUrl"
          :disabled="useCustomRpcUrl" :options="rpcUrlList" option-label="name" option-value="url" />
      </div>

      <InputField label="RPC URL" placeholder="RPC URL" v-model="rpcUrl" :disabled="!useCustomRpcUrl" />
    </Wrapper>


    <Wrapper title="Signer">
      <p class="body-text">
        Configure the signer settings for your application.
      </p>

      <div class="flex-column-wrapper w-full">
        <Checkbox v-model="useConnectWallet" label="Connect Wallet" />
        <InputField label="Private Key" placeholder="0xff" v-model="privateKey"
          :type="showPassword ? 'text' : 'password'" :disabled="useConnectWallet">
          <template #suffix>
            <Button @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </Button>
          </template>
        </InputField>
        <span class="body-text">
          Address: {{ address }}
        </span>
        <div class="flex-row-wrapper">
          <Button :disabled="useConnectWallet" @click="generateRandomWallet">Generate Random Wallet</Button>
          <Button :disabled="!useConnectWallet">Connect</Button>
        </div>
        <span v-if="walletError" class="error-text">{{ walletError }}</span>
      </div>
    </Wrapper>


    <Wrapper title="Contract">
      <p class="subtitle-text">
        Configure the network settings for your application.
      </p>
      <InputField class="w-full" label="Contract Address" placeholder="0x..." v-model="contractAddress" />
    </Wrapper>


    <Wrapper title="ABI">
      <div class="flex-column-wrapper w-full">
        <Checkbox label="Use Custom or Edit ABI" v-model="useCustomAbi" />
        <Select label="Select ABI" placeholder="Select ABI" v-model="selectedAbi" :options="abiNames"
          option-label="name" option-value="abi" :disabled="useCustomAbi">
          <template #suffix>
            <div class="flex-row-wrapper gap-2">
              <Button v-if="useCustomAbi" :disabled="!activeAddNewAbi" @click="addToList">Add new to List</Button>
              <Button v-if="selectedAbi && !isDefaultAbi"
                @click="() => { const result = removeAbi(selectedAbi); if (!result.success) alert(result.message); }">Remove</Button>
            </div>
          </template>
        </Select>
        <InputField v-if="useCustomAbi" label="Custom Name" placeholder="Custom Name" v-model="customAbiName" />
        <TextArea label="import Custom ABI here" placeholder="import Custom ABI here" v-model="abiContent" rows="20"
          :disabled="!useCustomAbi" />
        <div class="flex-row-wrapper gap-2">
          <Button @click="() => { const result = exportAbis(); if (!result.success) alert(result.message); }">Export
            ABIs</Button>
          <input type="file" id="import-file" accept=".json" style="display: none;"
            @change="(e) => { console.log('File input change event:', e.target.files); const file = e.target.files[0]; if (file) { handleImportAbis(file); e.target.value = ''; } }" />
          <Button @click="triggerFileInput">Import ABIs</Button>
        </div>
      </div>
    </Wrapper>

    <Wrapper title="Methods">
      <div class="list-wrapper">
        <p class="body-text" v-if="abiMethods.length === 0">
          No methods found. Please select an ABI or enter valid ABI content.
        </p>

        <MethodItem v-for="method in abiMethods" :key="method.name" :method="method" :contract-address="contractAddress"
          :abi-content="abiContent" :rpc-url="rpcUrl" :private-key="privateKey" />
      </div>
    </Wrapper>


  </main>
</template>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.list-wrapper {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  width: 100%;
  gap: 1rem
}

.error-text {
  color: var(--error);
  font-size: 0.875rem;
  font-weight: 500;
}

.gap-2 {
  gap: 0.5rem;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.clear-form-btn {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
