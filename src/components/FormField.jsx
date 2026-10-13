export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  options = [],
  error = "",
  min,
  step,
  disabled = false,
}) {
  const fieldId = `field-${name}`;

  return (
    <div className="form-group">
      <label htmlFor={fieldId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      {type === "select" ? (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
        >
          <option value="">Select {label.toLowerCase()}</option>

          {options.map((option) => {
            const item =
              typeof option === "string"
                ? { value: option, label: option }
                : option;

            return (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          step={step}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
        />
      )}

      {error && (
        <p id={`${fieldId}-error`} className="error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}