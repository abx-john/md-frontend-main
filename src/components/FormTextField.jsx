import { TextField } from "@mui/material";

const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

const FormTextField = ({
  name,
  form,
  errors,
  handleChange,
  multiline,
  readOnly,
  ...props
}) => {
  const value = getNestedValue(form, name) ?? "";
  const error = getNestedValue(errors, name);

  return (
    <TextField
      size="small"
      fullWidth
      multiline={multiline}
      rows={multiline ? 4 : undefined}
      value={value}
      onChange={handleChange(name)}
      InputProps={{
        readOnly:readOnly
       }}
      error={!!error}
      helperText={error ? error[0] : ""}
      {...props}
    />
  );
};

export default FormTextField;