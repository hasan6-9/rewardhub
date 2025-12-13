import { ref, computed } from "vue";

/**
 * Lightweight form validation composable
 * Provides common validation rules and error handling
 */
export function useFormValidation(initialValues = {}) {
  const values = ref({ ...initialValues });
  const errors = ref({});
  const touched = ref({});

  // Validation rules
  const rules = {
    required: (value) => {
      if (value === null || value === undefined || value === "") {
        return "This field is required";
      }
      return null;
    },

    email: (value) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
      return null;
    },

    minLength: (min) => (value) => {
      if (!value) return null;
      if (value.length < min) {
        return `Must be at least ${min} characters`;
      }
      return null;
    },

    maxLength: (max) => (value) => {
      if (!value) return null;
      if (value.length > max) {
        return `Must be no more than ${max} characters`;
      }
      return null;
    },

    pattern:
      (regex, message = "Invalid format") =>
      (value) => {
        if (!value) return null;
        if (!regex.test(value)) {
          return message;
        }
        return null;
      },

    match:
      (otherField, message = "Fields do not match") =>
      (value) => {
        if (!value) return null;
        if (value !== values.value[otherField]) {
          return message;
        }
        return null;
      },
  };

  // Validate a single field
  const validateField = (fieldName, fieldRules) => {
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = rule(values.value[fieldName]);
      if (error) {
        errors.value[fieldName] = error;
        return error;
      }
    }

    errors.value[fieldName] = null;
    return null;
  };

  // Validate all fields
  const validate = (schema) => {
    let isValid = true;

    for (const [fieldName, fieldRules] of Object.entries(schema)) {
      const error = validateField(fieldName, fieldRules);
      if (error) {
        isValid = false;
      }
    }

    return isValid;
  };

  // Mark field as touched
  const touch = (fieldName) => {
    touched.value[fieldName] = true;
  };

  // Reset form
  const reset = (newValues = {}) => {
    values.value = { ...newValues };
    errors.value = {};
    touched.value = {};
  };

  // Check if form is valid
  const isValid = computed(() => {
    return Object.values(errors.value).every((error) => !error);
  });

  // Check if field has error and is touched
  const getFieldError = (fieldName) => {
    return touched.value[fieldName] ? errors.value[fieldName] : null;
  };

  return {
    values,
    errors,
    touched,
    rules,
    validate,
    validateField,
    touch,
    reset,
    isValid,
    getFieldError,
  };
}
