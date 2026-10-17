'use client'

type Props =
  | { options: Record<string, string>; multiple: true; value: string[]; onChange: (v: string[]) => void; exclusive?: string[]; columns?: 2 | 3 }
  | { options: Record<string, string>; multiple?: false; value: string; onChange: (v: string) => void; exclusive?: never; columns?: 2 | 3 }

// Large tap targets for checkbox / radio choices on phones.
export default function ChoiceGroup(props: Props) {
  const { options, columns = 2 } = props
  const selected = props.multiple ? props.value : [props.value]

  const toggle = (key: string) => {
    if (!props.multiple) return props.onChange(props.value === key ? '' : key)
    const { value, onChange, exclusive = [] } = props
    if (value.includes(key)) return onChange(value.filter((k) => k !== key))
    // Exclusive options (like "No immediate danger") clear the others, and vice versa.
    if (exclusive.includes(key)) return onChange([key])
    onChange([...value.filter((k) => !exclusive.includes(k)), key])
  }

  return (
    <div className={`grid gap-2 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {Object.entries(options).map(([key, label]) => {
        const on = selected.includes(key)
        return (
          <label
            key={key}
            className={`chip ${on ? 'border-primary-500 bg-primary-50 font-medium text-primary-800' : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'}`}
          >
            <input type={props.multiple ? 'checkbox' : 'radio'} className="h-4 w-4 accent-teal-600" checked={on} onChange={() => toggle(key)} />
            {label}
          </label>
        )
      })}
    </div>
  )
}
