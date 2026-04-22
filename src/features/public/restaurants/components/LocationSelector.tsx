import { useMemo, useState } from "react"
import { ChevronDown, MapPin } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MOCK_DISTRICTS, MOCK_PROVINCES, type SelectOption } from "@/features/new/constants"

import type { FeedLocationSelection } from "../types"

interface LocationSelectorProps {
    onLocationChange?: (location: FeedLocationSelection) => void
}

const DEFAULT_PROVINCE = MOCK_PROVINCES[0] ?? null

export default function LocationSelector({ onLocationChange }: LocationSelectorProps) {
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<number>(DEFAULT_PROVINCE?.code ?? 1)
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null)

    const selectedProvince = useMemo<SelectOption | null>(() => {
        return MOCK_PROVINCES.find((province) => province.code === selectedProvinceCode) ?? null
    }, [selectedProvinceCode])

    const districts = useMemo<SelectOption[]>(() => {
        return MOCK_DISTRICTS[selectedProvinceCode] ?? []
    }, [selectedProvinceCode])

    const selectedDistrict = useMemo<SelectOption | null>(() => {
        if (selectedDistrictCode === null) return null
        return districts.find((district) => district.code === selectedDistrictCode) ?? null
    }, [districts, selectedDistrictCode])

    const displayText = useMemo(() => {
        if (selectedDistrict && selectedProvince) return `${selectedDistrict.name}, ${selectedProvince.name}`
        return selectedProvince?.name ?? "Chọn địa chỉ"
    }, [selectedDistrict, selectedProvince])

    const handleProvinceChange = (value: string) => {
        const provinceCode = Number(value)
        const province = MOCK_PROVINCES.find((item) => item.code === provinceCode)
        if (!province) return

        setSelectedProvinceCode(provinceCode)
        setSelectedDistrictCode(null)
        onLocationChange?.({ province, district: null })
    }

    const handleDistrictChange = (value: string) => {
        const districtCode = Number(value)
        const district = districts.find((item) => item.code === districtCode)
        if (!district || !selectedProvince) return

        setSelectedDistrictCode(districtCode)
        onLocationChange?.({ province: selectedProvince, district })
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Chọn địa điểm"
                    className="hidden items-center space-x-2 rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
                >
                    <MapPin className="h-5 w-5 text-red-500" />
                    <span className="max-w-[150px] truncate text-sm">{displayText}</span>
                    <ChevronDown className="h-4 w-4" />
                </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="z-50 mt-2 w-80 rounded-2xl border border-border bg-popover p-4">
                <div className="mb-3">
                    <label className="mb-1.5 block text-xs text-muted-foreground">Tỉnh/Thành phố</label>
                    <Select value={String(selectedProvinceCode)} onValueChange={handleProvinceChange}>
                        <SelectTrigger className="h-auto rounded-xl border-border bg-background py-2.5 pl-3 pr-10 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring/40">
                            <SelectValue placeholder="Chọn tỉnh/thành" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-popover">
                            {MOCK_PROVINCES.map((province) => (
                                <SelectItem key={province.code} value={String(province.code)}>
                                    {province.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">Quận/Huyện</label>
                    <Select
                        key={selectedProvinceCode}
                        value={selectedDistrictCode !== null ? String(selectedDistrictCode) : undefined}
                        onValueChange={handleDistrictChange}
                        disabled={!selectedProvince || districts.length === 0}
                    >
                        <SelectTrigger className="h-auto rounded-xl border-border bg-background py-2.5 pl-3 pr-10 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:bg-muted">
                            <SelectValue placeholder="Chọn quận/huyện" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-popover">
                            {districts.map((district) => (
                                <SelectItem key={district.code} value={String(district.code)}>
                                    {district.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </PopoverContent>
        </Popover>
    )
}
