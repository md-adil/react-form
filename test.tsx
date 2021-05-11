import React, { useEffect } from "react";
import {render} from "react-dom";
import { Button, Container, TextField} from "@material-ui/core";
import { useForm } from "./src";

function App() {
    const [fields, form] = useForm({
        name: { test: "required", message: "name is required" },
        phone: { test: /^[0-9]{5,10}$/, message: "phone is not valid"},
        email: { test: ["required", "email"], message: "email is not valid"},
    });
    const handleSave = () => {
        const val = form.validate();
        console.log(val, val?.name);
    };

    useEffect(() => {
        // set value dynamically
        form.setValues({name: "Some invalid name"})

        // set error dynamically
        form.setErrors({name: 'Name is not valid'});
    }, []);
    return (
        <Container>
            <TextField {...fields.name} placeholder="Say my name" fullWidth />
            <TextField placeholder="Email" {...fields.email} fullWidth />
            <TextField helperText="your phone number" {...fields.phone} placeholder="Phone" fullWidth />
            <Button onClick={handleSave}>Save</Button>
        </Container>
    )
}

render(<App />, document.getElementById('root'));
