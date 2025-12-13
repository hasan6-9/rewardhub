import { describe, it, expect } from "vitest";
import { useFormValidation } from "@/composables/useFormValidation";

describe("useFormValidation", () => {
  it("validates required fields correctly", () => {
    const { values, rules, validateField } = useFormValidation({
      email: "",
    });

    const error = validateField("email", [rules.required]);
    expect(error).toBe("This field is required");

    values.value.email = "test@example.com";
    const noError = validateField("email", [rules.required]);
    expect(noError).toBeNull();
  });

  it("validates email format correctly", () => {
    const { values, rules, validateField } = useFormValidation({
      email: "",
    });

    values.value.email = "invalid-email";
    const error = validateField("email", [rules.email]);
    expect(error).toBe("Please enter a valid email address");

    values.value.email = "valid@example.com";
    const noError = validateField("email", [rules.email]);
    expect(noError).toBeNull();
  });

  it("validates minimum length correctly", () => {
    const { values, rules, validateField } = useFormValidation({
      password: "",
    });

    values.value.password = "123";
    const error = validateField("password", [rules.minLength(8)]);
    expect(error).toBe("Must be at least 8 characters");

    values.value.password = "12345678";
    const noError = validateField("password", [rules.minLength(8)]);
    expect(noError).toBeNull();
  });

  it("validates entire form correctly", () => {
    const { values, rules, validate } = useFormValidation({
      email: "",
      password: "",
    });

    const schema = {
      email: [rules.required, rules.email],
      password: [rules.required, rules.minLength(8)],
    };

    expect(validate(schema)).toBe(false);

    values.value.email = "test@example.com";
    values.value.password = "12345678";
    expect(validate(schema)).toBe(true);
  });
});
