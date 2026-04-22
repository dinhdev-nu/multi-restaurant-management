import { type FormEvent, useState } from "react"

import Icon from "@/components/AppIcon"
import Button from "@/features/pos/components/Button"
import Input from "@/features/pos/components/Input"

interface QuickActionsProps {
  onBarcodeSearch: (query: string) => void
  onCustomerSearch: (query: string) => void
}

const QuickActions = ({ onBarcodeSearch, onCustomerSearch }: QuickActionsProps) => {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchQuery.trim()
    if (!query) return

    if (/^\d+$/.test(query)) {
      onBarcodeSearch(query)
    } else {
      onCustomerSearch(query)
    }

    setSearchQuery("")
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Tìm món ăn hoặc mã vạch..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" variant="outline" size="icon" className="hover-scale">
          <Icon name="Search" size={20} />
        </Button>
      </form>
    </div>
  )
}

export default QuickActions