function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )
}

export default FormField
