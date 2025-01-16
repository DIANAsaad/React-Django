import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key: string, defaultValue: string | null) => {
  // Initialize state with value from localStorage or the provided default.
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // If there's an existing item in localStorage, parse and use it;
      // otherwise, use defaultValue.
      return item ?? defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  // Create a setter that updates both React state and localStorage.
  const setValue = useCallback(
    (value: string | null) => {
      try {
        setStoredValue(value);
        if (value) {
          window.localStorage.setItem(key, value);
        } else {
          window.localStorage.removeItem(key);
        }
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key]
  );

  // Sync state with changes in localStorage (e.g., from other tabs/windows).
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          // If event.newValue is null, it means the key was removed.
          setStoredValue(event.newValue ? event.newValue : defaultValue);
        } catch (error) {
          console.warn(`Error parsing localStorage key “${key}”:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  return [storedValue, setValue as (value: string | null) => void] as const;
};

export default useLocalStorage;
