import { ref, computed, watch } from 'vue';
import defaultAbis from '@/content/abi';

export function useAbiManager() {
    // Reactive state
    const abis = ref({});
    const selectedAbi = ref('');
    const abiContent = ref('');
    const customAbiName = ref('');
    const useCustomAbi = ref(false);
    const activeAddNewAbi = ref(false);

    // Computed properties
    const abiNames = computed(() => Object.keys(abis.value));
    const hasAbis = computed(() => abiNames.value.length > 0);
    const isDefaultAbi = computed(() => {
        return selectedAbi.value && Object.keys(defaultAbis).includes(selectedAbi.value);
    });

    // Initialize ABIs from local storage and merge with default ABIs
    const initializeAbis = () => {
        try {
            const storedAbis = localStorage.getItem('abis');
            const parsedStoredAbis = storedAbis ? JSON.parse(storedAbis) : {};

            // Merge default ABIs with stored ABIs (stored ABIs take precedence)
            abis.value = { ...defaultAbis, ...parsedStoredAbis };
        } catch (error) {
            console.error('Error loading ABIs from localStorage:', error);
            // Fallback to default ABIs only
            abis.value = { ...defaultAbis };
        }
    };

    // Save ABIs to local storage
    const saveAbisToStorage = () => {
        try {
            localStorage.setItem('abis', JSON.stringify(abis.value));
        } catch (error) {
            console.error('Error saving ABIs to localStorage:', error);
        }
    };

    // Add new ABI to the list
    const addAbi = (name, abiContent) => {
        try {
            // Parse the ABI content to validate it's valid JSON
            const parsedAbi = JSON.parse(abiContent);

            // Validate that it's actually an ABI (array of objects with type property)
            if (!Array.isArray(parsedAbi)) {
                return { success: false, message: 'ABI must be an array of function definitions.' };
            }

            // Add the new ABI to the abis object
            abis.value[name] = parsedAbi;

            // Save to local storage
            saveAbisToStorage();

            console.log('ABI added successfully:', name);
            return { success: true, message: 'ABI added successfully' };
        } catch (error) {
            console.error('Invalid ABI JSON:', error);
            return { success: false, message: 'Invalid ABI JSON format. Please check your ABI content.' };
        }
    };

    // Remove ABI from the list
    const removeAbi = (name) => {
        if (abis.value[name]) {
            // Don't allow removal of default ABIs
            if (Object.keys(defaultAbis).includes(name)) {
                return { success: false, message: 'Cannot remove default ABIs.' };
            }

            delete abis.value[name];
            saveAbisToStorage();

            // If the removed ABI was selected, clear the selection
            if (selectedAbi.value === name) {
                selectedAbi.value = '';
                abiContent.value = '';
            }

            console.log('ABI removed successfully:', name);
            return { success: true, message: 'ABI removed successfully' };
        }
        return { success: false, message: 'ABI not found' };
    };

    // Get ABI content by name
    const getAbiContent = (name) => {
        return abis.value[name] ? JSON.stringify(abis.value[name], null, 2) : '';
    };

    // Update ABI content
    const updateAbiContent = (name, newContent) => {
        try {
            const parsedAbi = JSON.parse(newContent);

            // Validate that it's actually an ABI
            if (!Array.isArray(parsedAbi)) {
                return { success: false, message: 'ABI must be an array of function definitions.' };
            }

            abis.value[name] = parsedAbi;
            saveAbisToStorage();
            return { success: true, message: 'ABI updated successfully' };
        } catch (error) {
            console.error('Invalid ABI JSON:', error);
            return { success: false, message: 'Invalid ABI JSON format' };
        }
    };

    // Export all ABIs
    const exportAbis = () => {
        try {
            const dataStr = JSON.stringify(abis.value, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'abis.json';
            link.click();
            URL.revokeObjectURL(url);
            return { success: true, message: 'ABIs exported successfully' };
        } catch (error) {
            console.error('Error exporting ABIs:', error);
            return { success: false, message: 'Error exporting ABIs' };
        }
    };

    // Import ABIs from file
    const importAbis = (file) => {
        return new Promise((resolve) => {
            console.log('Starting import process for file:', file.name);
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    console.log('File read successfully, parsing JSON...');
                    const importedAbis = JSON.parse(e.target.result);
                    console.log('JSON parsed successfully, imported ABIs:', Object.keys(importedAbis));

                    // Validate imported ABIs
                    for (const [name, abi] of Object.entries(importedAbis)) {
                        if (!Array.isArray(abi)) {
                            console.error(`Invalid ABI format for ${name}:`, abi);
                            resolve({ success: false, message: `Invalid ABI format for ${name}` });
                            return;
                        }
                    }

                    console.log('ABIs validated successfully, merging with existing ABIs...');
                    // Merge imported ABIs with existing ones
                    abis.value = { ...abis.value, ...importedAbis };
                    saveAbisToStorage();

                    console.log('Import completed successfully');
                    resolve({ success: true, message: 'ABIs imported successfully' });
                } catch (error) {
                    console.error('Error importing ABIs:', error);
                    resolve({ success: false, message: 'Invalid JSON format in imported file' });
                }
            };
            
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                resolve({ success: false, message: 'Error reading file' });
            };
            
            reader.readAsText(file);
        });
    };

    // Watch for selected ABI changes and update the content
    watch(selectedAbi, (newSelectedAbi) => {
        if (newSelectedAbi && abis.value[newSelectedAbi]) {
            abiContent.value = JSON.stringify(abis.value[newSelectedAbi], null, 2);
            // Reset the add button state when selecting a predefined ABI
            activeAddNewAbi.value = false;
        } else {
            abiContent.value = '';
            activeAddNewAbi.value = false;
        }
    });

    // Watch for custom ABI mode changes
    watch(useCustomAbi, (newUseCustomAbi) => {
        if (!newUseCustomAbi) {
            // If switching back to predefined mode, disable the button
            activeAddNewAbi.value = false;
        }
    });

    // Watch for ABI content changes and compare with current selected ABI
    watch(abiContent, (newAbiContent) => {
        if (!useCustomAbi.value) {
            // If not in custom mode, disable the button
            activeAddNewAbi.value = false;
            return;
        }

        if (!newAbiContent || !newAbiContent.trim()) {
            // If no content, disable the button
            activeAddNewAbi.value = false;
            return;
        }

        // If there's a selected ABI, compare the content
        if (selectedAbi.value && abis.value[selectedAbi.value]) {
            const currentAbiString = JSON.stringify(abis.value[selectedAbi.value], null, 2);
            const isDifferent = newAbiContent.trim() !== currentAbiString.trim();
            activeAddNewAbi.value = isDifferent;
        } else {
            // If no selected ABI, enable the button if there's content
            activeAddNewAbi.value = true;
        }
    });

    // Add new ABI to list (with automatic naming)
    const addNewAbiToList = () => {
        if (abiContent.value) {
            const abiName = customAbiName.value || `Custom_${Date.now()}`;
            const result = addAbi(abiName, abiContent.value);

            if (result.success) {
                // Reset the form after adding
                customAbiName.value = '';
                activeAddNewAbi.value = false;
            }

            return result;
        }
        return { success: false, message: 'No ABI content to add' };
    };

    // Initialize on creation
    initializeAbis();

    return {
        // State
        abis,
        selectedAbi,
        abiContent,
        customAbiName,
        useCustomAbi,
        activeAddNewAbi,

        // Computed
        abiNames,
        hasAbis,
        isDefaultAbi,

        // Methods
        initializeAbis,
        addAbi,
        removeAbi,
        getAbiContent,
        updateAbiContent,
        addNewAbiToList,
        saveAbisToStorage,
        exportAbis,
        importAbis
    };
} 