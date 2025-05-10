"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { GothicNotification, type NotificationType } from "./gothic-notification"
import { AnimatePresence } from "framer-motion"

interface NotificationContextType {
  showNotification: (message: string, functionName: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([])

  const showNotification = (message: string, functionName: string) => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      functionName,
      timestamp: new Date().toISOString(),
    }

    setNotifications((prev) => [...prev, newNotification])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <AnimatePresence>
        {notifications.map((notification) => (
          <GothicNotification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
