"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-none",
          description: "group-[.toast]:text-gray-600 group-[.toast[data-type=error]]:text-black",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700",
          error: "group-[.toaster]:bg-red-50 group-[.toaster]:text-black group-[.toaster]:border-red-200",
          success: "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
