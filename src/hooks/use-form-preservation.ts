import { useEffect, useRef } from 'react';
import { saveFormData, getFormData, clearFormData } from '@/lib/utils/form-preservation';

/**
 * Hook to preserve form data during token refresh
 * 
 * @param formId - Unique identifier for the form (e.g., 'product-form', 'category-form')
 * @param formData - Current form data object
 * @param enabled - Whether to enable form preservation (default: true)
 * 
 * @example
 * const form = useForm();
 * useFormPreservation('product-form', form.getValues(), true);
 */
export function useFormPreservation(
  formId: string,
  formData: Record<string, unknown>,
  enabled: boolean = true
) {
  const previousDataRef = useRef<Record<string, unknown>>(formData);
  const isInitialMount = useRef(true);

  // Load saved form data on mount
  useEffect(() => {
    if (!enabled) return;

    const savedData = getFormData(formId);
    if (savedData && Object.keys(savedData).length > 0) {
      // Restore form data if available
      // Note: The form component should handle the restoration
      // This hook just provides the data
      console.log(`[Form Preservation] Restored data for form: ${formId}`);
    }
  }, [formId, enabled]);

  // Save form data whenever it changes (debounced)
  useEffect(() => {
    if (!enabled || isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only save if data has actually changed
    const hasChanged = JSON.stringify(previousDataRef.current) !== JSON.stringify(formData);
    
    if (hasChanged && Object.keys(formData).length > 0) {
      // Debounce saves to avoid excessive writes
      const timeoutId = setTimeout(() => {
        saveFormData(formId, formData);
        previousDataRef.current = formData;
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [formId, formData, enabled]);

  // Clear form data when component unmounts (optional)
  // Uncomment if you want to clear on unmount
  // useEffect(() => {
  //   return () => {
  //     clearFormData(formId);
  //   };
  // }, [formId]);

  return {
    getSavedData: () => getFormData(formId),
    clearSavedData: () => clearFormData(formId),
  };
}

