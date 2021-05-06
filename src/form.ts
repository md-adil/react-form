import { Dispatch, ReactText, SetStateAction, useRef, useState } from "react";

type Test = RegExp | "required" | "email";
type Rule = { message?: string; test?: Test | Test[] };
type Rules<T> = {
    [K in keyof T]: Rule | Rule[];
};

type Field = {
    error: boolean;
    onChange(e: any): void;
    value: ReactText;
    helperText?: string;
}

type Fields<T> = {
    [K in keyof T]: Field;
};

type Values<T> = {
    [K in keyof T]: ReactText;
};

function getDefaultState<T>( props: Rules<T>, handleChange: (fieldName: keyof T, val: ReactText) => void): Fields<T> {
    const fields: any = {};
    for (const prop in props) {
        if (!Object.prototype.hasOwnProperty.call(props, prop)) {
            continue;
        }
        const field = {
            error: false,
            value: "",
            onChange(e: any) {
                handleChange(prop, e.target.value);
            },
        };
        fields[prop] = field;
    }
    return fields;
}

function isInvalid(rules?: Rule | Rule[], value: ReactText = ""): string | undefined {
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

function validate<T>(
    rules: Rules<T>,
    setFields: Dispatch<SetStateAction<Fields<T>>>
): Values<T> | null {
    let hasError = false;
    const values: any = {};
    setFields((fields) => {
        const newFields: any = {};
        for (const key in rules) {
            if (!Object.prototype.hasOwnProperty.call(rules, key)) {
                continue;
            }
            const f = validateField(fields[key], rules[key], fields[key].value);
            newFields[key] = f;
            if (f.error) {
                hasError = true;
            }
            values[key] = f.value;
        }
        return newFields;
    });
    if (hasError) {
        return null;
    }
    return values;
}

function validateField(
    field: Field,
    rule: Rule | Rule[],
    value: ReactText
): Field {
    const error = isInvalid(rule, value);
    return {
        ...field,
        error: Boolean(error),
        value,
        helperText: error,
    };
}

export function useForm<T>(rules: Rules<T>) {
    const isDirty = useRef(false);
    const [fields, setFields] = useState(() => getDefaultState(rules, (key, val) => {
            if (isDirty.current) {
                setFields((fields) => ({
                    ...fields,
                    [key]: validateField(fields[key], rules[key], val),
                }));
            } else {
                setFields((fields) => ({
                    ...fields,
                    [key]: { ...fields[key], value: val },
                }));
            }
        })
    );
    return [
        fields,
        () => {
            isDirty.current = true;
            return validate(rules, setFields);
        },
    ] as const;
}
