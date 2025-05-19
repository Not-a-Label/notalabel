// Onboarding state management utilities
const ONBOARDING_FLAG_KEY = 'isNewUser';
const ONBOARDING_STEP_KEY = 'onboardingStep';
const ONBOARDING_DATA_KEY = 'onboardingData';

/**
 * Mark a user as new (just registered) to trigger onboarding flow
 */
export const markUserAsNew = (): void => {
  try {
    sessionStorage.setItem(ONBOARDING_FLAG_KEY, 'true');
  } catch (error) {
    console.error('Failed to set onboarding flag:', error);
  }
};

/**
 * Check if a user is new and should go through onboarding
 */
export const isNewUser = (): boolean => {
  try {
    return sessionStorage.getItem(ONBOARDING_FLAG_KEY) === 'true';
  } catch (error) {
    console.error('Failed to get onboarding flag:', error);
    return false;
  }
};

/**
 * Clear the new user flag, called after onboarding is complete or skipped
 */
export const clearNewUserFlag = (): void => {
  try {
    sessionStorage.removeItem(ONBOARDING_FLAG_KEY);
  } catch (error) {
    console.error('Failed to clear onboarding flag:', error);
  }
};

/**
 * Save onboarding step to allow resuming if user refreshes
 */
export const saveOnboardingStep = (step: number): void => {
  try {
    sessionStorage.setItem(ONBOARDING_STEP_KEY, step.toString());
  } catch (error) {
    console.error('Failed to save onboarding step:', error);
  }
};

/**
 * Get the saved onboarding step
 */
export const getOnboardingStep = (): number => {
  try {
    const step = sessionStorage.getItem(ONBOARDING_STEP_KEY);
    return step ? parseInt(step, 10) : 1;
  } catch (error) {
    console.error('Failed to get onboarding step:', error);
    return 1;
  }
};

/**
 * Save onboarding data (profile info, preferences, etc.)
 */
export const saveOnboardingData = (data: Record<string, any>): void => {
  try {
    const existingData = getOnboardingData();
    const updatedData = { ...existingData, ...data };
    sessionStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Failed to save onboarding data:', error);
  }
};

/**
 * Get saved onboarding data
 */
export const getOnboardingData = (): Record<string, any> => {
  try {
    const dataStr = sessionStorage.getItem(ONBOARDING_DATA_KEY);
    return dataStr ? JSON.parse(dataStr) : {};
  } catch (error) {
    console.error('Failed to get onboarding data:', error);
    return {};
  }
};

/**
 * Clear all onboarding data when complete
 */
export const clearOnboardingData = (): void => {
  try {
    sessionStorage.removeItem(ONBOARDING_STEP_KEY);
    sessionStorage.removeItem(ONBOARDING_DATA_KEY);
    clearNewUserFlag();
  } catch (error) {
    console.error('Failed to clear onboarding data:', error);
  }
}; 