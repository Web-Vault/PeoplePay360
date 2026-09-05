import { cn } from '../../utils/helpers'

export default function Input({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  errors,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  ...props
}) {
  const inputId = id || name
  const hasError = Boolean(errors)

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          id={inputId}
          name={name || inputId}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            'block w-full rounded-lg border bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            hasError
              ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300',
            Icon ? 'pl-10' : 'pl-3',
            RightIcon ? 'pr-10' : 'pr-3',
            'py-2.5 text-sm',
            disabled && 'bg-slate-50 cursor-not-allowed',
            inputClassName
          )}
          {...props}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            <RightIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {hasError && (
        <p className="mt-1.5 text-sm text-red-600">{errors}</p>
      )}
    </div>
  )
}
