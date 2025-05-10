"use client"

import { motion } from "framer-motion"
import { useEffect } from "react"

export type NotificationType = {
  id: string
  message: string
  functionName: string
  timestamp: string
}

interface GothicNotificationProps {
  notification: NotificationType
  onClose: () => void
}

export function GothicNotification({ notification, onClose }: GothicNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
    >
      <div className="bg-black/90 border border-red-900/50 p-4 rounded-sm shadow-[0_0_15px_rgba(127,29,29,0.5)] relative overflow-hidden">
        {/* Blood drip */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-0 bg-red-800 blood-drip-notification"></div>

        {/* Ornate corners */}
        <div className="absolute top-1 left-1 w-6 h-6 border-t border-l border-red-900/70"></div>
        <div className="absolute top-1 right-1 w-6 h-6 border-t border-r border-red-900/70"></div>
        <div className="absolute bottom-1 left-1 w-6 h-6 border-b border-l border-red-900/70"></div>
        <div className="absolute bottom-1 right-1 w-6 h-6 border-b border-r border-red-900/70"></div>

        <div className="text-center">
          <h3 className="text-xl font-gothic text-red-700 mb-1 tracking-wider">
            <span className="text-red-700">†</span> Serverless Invocation <span className="text-red-700">†</span>
          </h3>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent my-2"></div>

          <p className="text-stone-300 font-gothic tracking-wide text-sm mb-2">{notification.message}</p>

          <div className="text-xs text-stone-500 font-gothic">
            <span className="text-red-900/70">{notification.functionName}</span> was summoned from beyond the veil
          </div>
        </div>
      </div>
    </motion.div>
  )
}
