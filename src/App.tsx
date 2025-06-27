import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, Search, Trash2, Moon, Sun, Image as ImageIcon, X, Plus, Eye, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

// TypeScript interfaces :
interface ImageData {
  id: string
  name: string
  originalName: string
  src: string
  size: number
  type: string
  uploadDate: string
}

const App: React.FC = () => {
  // State management :
  const [images, setImages] = useState<ImageData[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [previewFiles, setPreviewFiles] = useState<File[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  // Load images from localStorage on component mount
  useEffect(() => {
    const savedImages = localStorage.getItem('gallery-images')
    if (savedImages) {
      try {
        const parsedImages: ImageData[] = JSON.parse(savedImages)
        setImages(parsedImages)
      } catch (error) {
        console.error('Error loading saved images:', error)
        setImages([])
      }
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme-preference')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Save images to localStorage whenever images change
  useEffect(() => {
    try {
      localStorage.setItem('gallery-images', JSON.stringify(images))
    } catch (error) {
      console.error('Error saving images:', error)
    }
  }, [images])

  // Theme toggle handler
  const toggleTheme = (): void => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme-preference', !isDarkMode ? 'dark' : 'light')
  }

  // File validation
  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Please upload images only.`)
    }
    
    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`)
    }
    
    return true
  }

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = error => reject(error)
    })
  }

  // Handle file upload
  const handleFileUpload = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    
    try {
      const fileArray = Array.from(files)
      const validFiles: File[] = []
      
      // Validate all files first
      for (const file of fileArray) {
        try {
          validateFile(file)
          validFiles.push(file)
        } catch (error) {
          console.error(`File validation failed for ${file.name}:`, (error as Error).message)
          // You could show a toast notification here
        }
      }
      
      if (validFiles.length === 0) {
        throw new Error('No valid image files to upload')
      }

      const newImages: ImageData[] = []
      
      // Process each valid file
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        
        try {
          const base64 = await fileToBase64(file)
          const imageData: ImageData = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            originalName: file.name,
            src: base64,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString()
          }
          
          newImages.push(imageData)
          
          // Update progress
          const progress = ((i + 1) / validFiles.length) * 100
          setUploadProgress(progress)
          
          // Small delay to show progress animation
          if (i < validFiles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error)
        }
      }
      
      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages])
      }
      
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setPreviewFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files)
    }
  }

  // Delete image
  const deleteImage = (imageId: string): void => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  // Filter images based on search term
  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 gradient-hero opacity-90 -z-10" />
      <div className="fixed inset-0 bg-gradient-to-br from-transparent via-black/5 to-black/10 -z-10" />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 glass-card border-0 border-b border-white/20 rounded-none backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Futuristic Gallery</h1>
            </motion.div>
            
            <motion.button
              onClick={toggleTheme}
              className="glass-button p-3 text-white hover:text-blue-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center py-12"
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-white mb-6 animate-float"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Welcome to the Future
          </motion.h2>
          <motion.p 
            className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Experience the next generation of image management with stunning glassmorphism design and smooth animations.
          </motion.p>
        </motion.section>

        {/* Search Bar */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="search-bar"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input pl-12 text-white placeholder:text-white/60"
            />
          </div>
        </motion.section>

        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="glass-card p-8"
        >
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">Upload Your Images</h3>
          
          <div
            ref={dragRef}
            className={`drag-zone relative p-12 rounded-2xl text-center transition-all duration-300 ${
              dragActive ? 'drag-over' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="loading-spinner mx-auto" />
                <p className="text-white/80">Uploading images...</p>
                <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-white/60">{Math.round(uploadProgress)}% complete</p>
              </div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  className="w-16 h-16 mx-auto rounded-full gradient-accent flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Upload className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <p className="text-xl text-white mb-2">Drag & drop your images here</p>
                  <p className="text-white/60 mb-4">or</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-button px-8 py-3 text-white font-medium"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Choose Files
                  </Button>
                </div>
                <p className="text-sm text-white/50">
                  Supports: JPG, PNG, GIF, WebP (Max 10MB each)
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Image Gallery */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white">
              Your Gallery {filteredImages.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </h3>
          </div>

          {filteredImages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-24 h-24 mx-auto rounded-full gradient-secondary flex items-center justify-center mb-6">
                <ImageIcon className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'No images found' : 'No images yet'}
              </h4>
              <p className="text-white/60">
                {searchTerm 
                  ? `No images match "${searchTerm}". Try a different search term.`
                  : 'Upload your first image to get started!'
                }
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="image-grid"
            >
              <AnimatePresence>
                {filteredImages.map((image) => (
                  <motion.div
                    key={image.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                    layout
                    className="image-card glass-card overflow-hidden"
                  >
                    <div className="relative group">
                      <img
                        src={image.src}
                        alt={image.name}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                      
                      <div className="image-overlay">
                        <div className="flex-1">
                          <h4 className="text-white font-medium truncate">{image.name}</h4>
                          <p className="text-white/70 text-sm">{formatFileSize(image.size)}</p>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="glass-button p-2 text-white hover:text-blue-300"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="modal-content max-w-4xl max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle className="text-white">{image.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <img
                                  src={image.src}
                                  alt={image.name}
                                  className="max-w-full max-h-[60vh] object-contain mx-auto"
                                />
                                <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
                                  <div>
                                    <span className="font-medium">File name:</span> {image.originalName}
                                  </div>
                                  <div>
                                    <span className="font-medium">Size:</span> {formatFileSize(image.size)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Type:</span> {image.type}
                                  </div>
                                  <div>
                                    <span className="font-medium">Uploaded:</span> {new Date(image.uploadDate).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="p-2 bg-red-600/80 hover:bg-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="modal-content">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Image</AlertDialogTitle>
                                <AlertDialogDescription className="text-white/80">
                                  Are you sure you want to delete "{image.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="glass-button text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteImage(image.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="glass-card border-0 border-t border-white/20 rounded-none mt-16"
      >
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-white/60">
            Built with React, TypeScript, Tailwind CSS, and Framer Motion
          </p>
          <p className="text-white/40 text-sm mt-2">
            Futuristic Image Gallery © 2025
          </p>
        </div>
      </motion.footer>
    </div>
  )
}

export default App

