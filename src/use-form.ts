import { ReactText, useRef, useState } from "react";
import { Fields, Form, Rules } from "./form";
import { validateField } from "./validator";

function getDefaultState<T>(props: Rules<T>, handleChange: (fieldName: keyof T, val: ReactText) => void): Fields<Rules<T>> {
    const fields: any = {};
    for (const prop in props) {
        if (!Object.prototype.hasOwnProperty.call(props, prop)) {
            continue;
        }
        const field = {
            value: "",
            onChange(e: any) {
                handleChange(prop, e.target ? e.target.value : e);
            },
        };
        fields[prop] = field;
    }
    return fields;
}

export default function useForm<T>(rules: Rules<T>) {
    const isDirty = useRef(false);
    const [fields, setFields] = useState(() =>
        getDefaultState(rules, (key, val) => {
            const rule = rules[key];
            if (!rule) {
                return;
            }
            if (isDirty.current) {
                setFields((fields) => ({
                    ...fields,
                    [key]: validateField(fields[key], rule, val),
                }));
            } else {
                setFields((fields) => ({
                    ...fields,
                    [key]: { ...fields[key], value: val },
                }));
            }
        })
    );
    return [fields, new Form(rules, fields, setFields, isDirty)] as const;
}
