'use client'

import React, { SelectHTMLAttributes, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', children, value, onChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Extract options from children
    const options = React.Children.toArray(children)
      .map((child) => {
        if (React.isValidElement<{ value?: string | number; children?: React.ReactNode }>(child) && child.type === 'option') {
          return { value: child.props.value ?? '', label: child.props.children }
        }
        return null
      })
      .filter(Boolean) as { value: string | number; label: React.ReactNode }[]

    const selectedOption = options.find((opt) => String(opt.value) === String(value))
    const displayLabel = selectedOption ? selectedOption.label : (options[0]?.label || 'Select...')

    // Close on click outside
    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleOutsideClick)
      return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [])

    const handleSelect = (newValue: string | number) => {
      if (onChange) {
        // Create a synthetic-like event to satisfy standard onChange handlers
        const event = {
          target: { value: newValue, name: props.name },
          currentTarget: { value: newValue, name: props.name }
        } as unknown as React.ChangeEvent<HTMLSelectElement>
        onChange(event)
      }
      setIsOpen(false)
    }

    return (
      <div className="relative" ref={containerRef}>
        {/* Hidden native select for form submission / ref compatibility */}
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className="hidden"
          {...props}
        >
          {children}
        </select>

        {/* Custom Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between rounded-xl bg-surface-container border px-4 py-3 text-on-surface focus:outline-none transition-colors ${
            error ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
          } ${isOpen ? 'border-primary' : ''} ${className}`}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown
            size={16}
            className={`text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Custom Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg shadow-black/50 overflow-hidden animate-slide-up max-h-60 overflow-y-auto">
            <ul className="py-1">
              {options.map((opt, i) => (
                <li
                  key={i}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors hover:bg-primary/10 hover:text-primary ${
                    String(value) === String(opt.value) ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {String(value) === String(opt.value) && <Check size={16} className="text-primary flex-shrink-0 ms-2" />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
