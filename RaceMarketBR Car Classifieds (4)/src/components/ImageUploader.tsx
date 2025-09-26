
import React, { useState, useRef } from 'react'
import {Upload, X, Image, ExternalLink} from 'lucide-react'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label: string
  accept?: string
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  value, 
  onChange, 
  label,
  accept = "image/*"
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  const clearImage = () => {
    onChange('')
  }

  return (
    <div className="space-y-4">
      <label className="block text-white font-montserrat font-600">
        {label}
      </label>

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-800"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary-red bg-primary-red/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            Arraste uma imagem aqui ou clique para selecionar
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Image className="w-4 h-4" />
              <span>Selecionar Arquivo</span>
            </button>
            
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>URL Externa</span>
            </button>
          </div>
        </div>
      )}

      {showUrlInput && (
        <div className="flex space-x-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="flex-1 px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
          />
          <button
            onClick={handleUrlSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />
    </div>
  )
}

export default ImageUploader
