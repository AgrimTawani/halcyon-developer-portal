'use client'

interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function TextInput({ value, onChange, onSubmit, disabled }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) onSubmit()
    }
  }

  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label="Prompt input"
      aria-required="true"
      aria-multiline="true"
      placeholder="What would you like to test today?"
      style={{
        flex: 1,
        background: 'transparent',
        border: 'none',
        borderLeft: '2px solid transparent',
        padding: 'var(--space-5) var(--space-6)',
        paddingLeft: 'calc(var(--space-6) - 2px)',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '14px',
        lineHeight: 1.85,
        color: 'var(--text-primary)',
        resize: 'none',
        width: '100%',
        minHeight: '160px',
        outline: 'none',
        transition: 'border-left-color var(--dur-base)',
        caretColor: 'var(--accent)',
        overflowY: 'auto',
      }}
      onFocus={e => {
        e.currentTarget.style.borderLeftColor = 'var(--accent)'
        e.currentTarget.style.paddingLeft = 'calc(var(--space-6) - 2px)'
      }}
      onBlur={e => {
        e.currentTarget.style.borderLeftColor = 'transparent'
      }}
    />
  )
}
