import { Dispatch, MutableRefObject, ReactText, SetStateAction } from "react";
import { validateField } from "./validator";

export type Field = {
    error?: boolean;
    onChange(e: any): void;
    value: ReactText;
    helperText?: string;
};

export type Fields<T> = {
    [K in keyof T]: T[K] extends { isMulti: true } ? Field[] : Field;
};

export type Values<T> = {
    [K in keyof T]: ReactText;
};

export type Errors<T> = {
    [K in keyof T]: string;
};

export type Test = RegExp | "required" | "email";
export interface BaseRule {
    message?: string;
    test?: Test | Test[];
}
export interface Rule extends BaseRule {
    rules?: BaseRule[];
    isMulti?: boolean;
}
export type Rules<T> = {
    [K in keyof T]?: Rule;
};

export class Form<T> {
    constructor(
        public readonly rules: Rules<T>,
        public readonly fields: Fields<T>,
        public readonly setFields: Dispatch<SetStateAction<Fields<T>>>,
        public readonly isDirty: MutableRefObject<boolean>
    ) {}
    setValues(values: Partial<Values<T>>) {
        this.setFields((fields) => {
            const newFields = { ...fields };
            for (const key in values) {
                if (!Object.prototype.hasOwnProperty.call(values, key)) {
                    continue;
                }

                newFields[key].value = values[key]!;
            }
            return newFields;
        });
    }
    setErrors(errors: Partial<Errors<T>>) {
        this.setFields((fields) => {
            const newFields = { ...fields };
            for (const key in errors) {
                if (!Object.prototype.hasOwnProperty.call(errors, key)) {
                    continue;
                }
                newFields[key].error = Boolean(errors[key]);
                newFields[key].helperText = errors[key];
            }
            return newFields;
        });
    }

    validate() {
        this.isDirty.current = true;
        let hasError = false;
        const values: any = {};
        const newFields: any = {};
        for (const key in this.rules) {
            if (!Object.prototype.hasOwnProperty.call(this.rules, key)) {
                continue;
            }
            if (!this.rules[key]) {
                continue;
            }
            const f = validateField(this.fields[key], this.rules[key]!, this.fields[key].value);
            newFields[key] = f;
            if (f.error) {
                hasError = true;
            }
            values[key] = f.value;
        }
        this.setFields(newFields);
        if (hasError) {
            return null;
        }
        return values;
    }
}
