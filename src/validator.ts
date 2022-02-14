import type { ReactText } from "react";
import type { Field, Rule, Test } from "./form";

export function validateField(field: Field, rule: Rule | Rule[], value: ReactText): Field {
    const error = isInvalid(rule, value);
    if (error) {
        return {
            ...field,
            error: true,
            value,
            helperText: error,
        };
    }
    return {
        value,
        onChange: field.onChange,
    };
}

export function isInvalid(rules?: Rule | Rule[], value: ReactText = ""): string | undefined {
    if (!rules) {
        return;
    }
    if (Array.isArray(rules)) {
        for (const rule of rules) {
            const err = isInvalid(rule, value);
            if (err) {
                return err;
            }
        }
        return;
    }

    if (Array.isArray(rules.test)) {
        for (const pattern of rules.test) {
            if (!test(pattern, value)) {
                return rules.message;
            }
        }
        return;
    }
    if (rules.test) {
        if (!test(rules.test, value)) {
            return rules.message;
        }
    }
}

function test(pattern: Test, value: ReactText): boolean {
    switch (pattern) {
        case "email":
            return !value || /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(`${value}`);
        case "required":
            return Boolean(value);
        default:
            return pattern.test(`${value}`);
    }
}
