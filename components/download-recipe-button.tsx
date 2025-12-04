"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DownloadRecipeButtonProps {
  recipe: any
}

export function DownloadRecipeButton({ recipe }: DownloadRecipeButtonProps) {
  const handleDownload = () => {
    // Trigger browser print dialog (users can save as PDF)
    window.print()
  }

  return (
    <Button 
      onClick={handleDownload}
      className="!bg-[#D4A771] !text-white hover:!bg-[#C69963] flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Download Recipe
    </Button>
  )
}

