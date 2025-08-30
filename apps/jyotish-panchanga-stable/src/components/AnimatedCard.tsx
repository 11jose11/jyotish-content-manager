import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = "",
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={className}>
        {children}
      </Card>
    </motion.div>
  )
}

export default AnimatedCard
