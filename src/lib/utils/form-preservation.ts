/**
 * Form Data Preservation Utility
 * 
 * Preserves form data in sessionStorage during token refresh
 * to prevent data loss when user is filling long forms.
 */

const FORM_DATA_KEY_PREFIX = 'form_data_';

/**
 * Save form data to sessionStorage
 * @param formId - Unique identifier for the form
 * @param formData - Form data object to save
 */
export function saveFormData(formId: string, formData: Record<string, unknown>): void {
  try {
    const key = `${FORM_DATA_KEY_PREFIX}${formId}`;
    sessionStorage.setItem(key, JSON.stringify({
      data: formData,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.warn('Failed to save form data:', error);
  }
}

/**
 * Retrieve saved form data from sessionStorage
 * @param formId - Unique identifier for the form
 * @returns Saved form data or null if not found
 */
export function getFormData(formId: string): Record<string, unknown> | null {
  try {
    const key = `${FORM_DATA_KEY_PREFIX}${formId}`;
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    // Optional: Check if data is too old (e.g., > 1 hour)
    const maxAge = 60 * 60 * 1000; // 1 hour
    if (Date.now() - parsed.timestamp > maxAge) {
      clearFormData(formId);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.warn('Failed to retrieve form data:', error);
    return null;
  }
}

/**
 * Clear saved form data from sessionStorage
 * @param formId - Unique identifier for the form
 */
export function clearFormData(formId: string): void {
  try {
    const key = `${FORM_DATA_KEY_PREFIX}${formId}`;
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear form data:', error);
  }
}

/**
 * Clear all saved form data
 */
export function clearAllFormData(): void {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(FORM_DATA_KEY_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear all form data:', error);
  }
}

