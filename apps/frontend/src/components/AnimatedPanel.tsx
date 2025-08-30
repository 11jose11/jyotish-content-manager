import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedPanelProps {
  isOpen: boolean
  children: React.ReactNode
  className?: string
}

const AnimatedPanel: React.FC<AnimatedPanelProps> = ({ 
  isOpen, 
  children, 
  className = "" 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className={`overflow-hidden ${className}`}
        >
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            exit={{ y: -10 }}
            transition={{
              duration: 0.2,
              delay: 0.1
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedPanel
