
import React, { useState } from 'react'
import {Palette} from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label: string
  presets?: string[]
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  label, 
  presets = [
    '#E53E3E', '#3182CE', '#38A169', '#D69E2E', '#9F7AEA',
    '#ED8936', '#E53E3E', '#1A1A1A', '#2D3748', '#4A5568'
  ]
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <label className="block text-white font-montserrat font-600 mb-2">
        {label}
      </label>
      
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all hover:border-primary-red"
          style={{ backgroundColor: value }}
        >
          <Palette className="w-5 h-5 text-white drop-shadow-lg" />
        </button>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
          placeholder="#000000"
        />
        
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border border-gray-600 cursor-pointer"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-primary-gray border border-gray-800 rounded-lg shadow-xl z-50">
          <div className="grid grid-cols-5 gap-2 mb-3">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  onChange(preset)
                  setIsOpen(false)
                }}
                className="w-8 h-8 rounded border border-gray-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: preset }}
                title={preset}
              />
            ))}
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-center text-gray-400 text-sm hover:text-white transition-colors"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}

export default ColorPicker
