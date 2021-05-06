```tsx
import React from "react";
import {render} from "react-dom";
import { Button, TextField } from "@material-ui/core";
import { useForm } from "material-ui-react-form";

function App() {
    const [fields, validate] = useForm({
        name: { test: "required", message: "Name is required"},
        email: { test: ["required", "email"], message: "Enter valid email"},
        phone: { test: "required", message: "Enter valid phone"},
    });


    const handleSave = () => {
        const values = validate();
        console.log(values) // {name: "some name", email: "some email", phone: "some phone"}
    }
    return (
        <div>
            <TextField {...fields.name} placeholder="Say my name" fullWidth />
            <TextField {...fields.email} placeholder="Email" fullWidth />
            <TextField {...fields.phone} placeholder="Phone" fullWidth />
            <Button onClick={handleSave}>Save</Button>
        </div>
    )
}

render(<App />, document.getElementById('root'));

```