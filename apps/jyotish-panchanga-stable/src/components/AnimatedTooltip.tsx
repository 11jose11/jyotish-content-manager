import React from 'react'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface AnimatedTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  delay?: number
}

const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({ 
  children, 
  content, 
  delay = 0 
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay }}
        >
          {children}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

export default AnimatedTooltip
