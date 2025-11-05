import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { getData, filterDataframe, formatWithCommas, FilterOptions } from '../utils/dataGenerator'
import { StatBox } from '../components/StatBox'
import { FilterDropdown } from '../components/FilterDropdown'
import { SegmentGroupedBarChart } from '../components/SegmentGroupedBarChart'
import { RegionCountryStackedBarChart } from '../components/RegionCountryStackedBarChart'
import { DemoNotice } from '../components/DemoNotice'
import { useTheme } from '../context/ThemeContext'
import { InfoTooltip } from '../components/InfoTooltip'

interface MarketAnalysisProps {
  onNavigate: (page: string) => void
}

type MarketEvaluationType = 'By Value' | 'By Volume'
type SegmentType = 'By Brand' | 'By Age' | 'By Gender' | 'By ROA' | 'By FDF' | 'By Procurement' | null

interface MarketAnalysisFilters extends FilterOptions {
  vaccineType?: string[]
  marketEvaluation?: MarketEvaluationType
  segment?: SegmentType
  // Segment-specific filters
  brand?: string[]
  ageGroup?: string[]
  gender?: string[]
  roa?: string[]
  dosageForm?: string[]
  procurementType?: string[]
  // Cross-segment analysis
  crossSegment?: SegmentType
  // Standalone cross-segment analysis filters
  crossSegmentPrimary?: SegmentType
  crossSegmentPrimaryBrand?: string[]
  crossSegmentPrimaryAgeGroup?: string[]
  crossSegmentPrimaryGender?: string[]
  crossSegmentPrimaryRoa?: string[]
  crossSegmentPrimaryDosageForm?: string[]
  crossSegmentPrimaryProcurementType?: string[]
  // Cross-segment sub-filters
  crossSegmentBrand?: string[]
  crossSegmentAgeGroup?: string[]
  crossSegmentGender?: string[]
  crossSegmentRoa?: string[]
  crossSegmentDosageForm?: string[]
  crossSegmentProcurementType?: string[]
}

export function MarketAnalysis({ onNavigate }: MarketAnalysisProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  let data: any[] = []
  try {
    data = getData()
  } catch (error) {
    console.error('Error loading data:', error)
    data = []
  }
  
  const [filters, setFilters] = useState<MarketAnalysisFilters>(() => {
    try {
    const availableYears = [...new Set(data.map(d => d.year))].sort()
    const availableCountries = [...new Set(data.map(d => d.country))].sort()
    const availableDiseases = [...new Set(data.map(d => d.disease))].sort()
    
    const year2025 = availableYears.includes(2025) ? ['2025'] : (availableYears.length > 0 ? [String(availableYears[availableYears.length - 1])] : [])
      const defaultCountries = availableCountries.length >= 2 && availableCountries.includes('USA') && availableCountries.includes('Canada')
      ? ['USA', 'Canada']
        : availableCountries.length >= 2
          ? availableCountries.slice(0, 2)
          : availableCountries.length === 1
            ? [availableCountries[0]]
            : []
      
      const defaultDiseases = availableDiseases.length >= 2 && availableDiseases.includes('Influenza') && availableDiseases.includes('HPV')
      ? ['Influenza', 'HPV']
      : availableDiseases.length >= 2
        ? availableDiseases.slice(0, 2)
        : availableDiseases.length === 1
          ? [availableDiseases[0]]
          : []
    
    // Get available brands for default selection
      let defaultBrands: string[] = []
      if (year2025.length > 0 && defaultDiseases.length > 0 && defaultCountries.length > 0) {
        try {
    const baseData = filterDataframe(data, {
            year: year2025.map(y => Number(y)),
      disease: defaultDiseases,
      country: defaultCountries,
    } as FilterOptions)
    const availableBrands = [...new Set(baseData.map(d => d.brand))].sort()
          defaultBrands = availableBrands.length >= 2
      ? availableBrands.slice(0, 2)
      : availableBrands.length === 1
        ? [availableBrands[0]]
        : []
        } catch (error) {
          console.error('Error filtering data for brands:', error)
        }
      }
    
    return {
        year: year2025.length > 0 ? year2025.map(y => Number(y)) : (availableYears.length > 0 ? [availableYears[0]] : []),
      vaccineType: defaultDiseases,
      country: defaultCountries,
      marketEvaluation: 'By Value',
      segment: 'By Brand',
      brand: defaultBrands,
      }
    } catch (error) {
      console.error('Error initializing filters:', error)
      return {
        year: [],
        vaccineType: [],
        country: [],
        marketEvaluation: 'By Value',
        segment: 'By Brand',
        brand: [],
      }
    }
  })

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    try {
    let filtered = filterDataframe(data, {
        year: filters.year && filters.year.length > 0 ? filters.year : undefined,
        disease: filters.vaccineType && filters.vaccineType.length > 0 ? filters.vaccineType : undefined,
        country: filters.country && filters.country.length > 0 ? filters.country : undefined,
    } as FilterOptions)
    
    // Apply segment-specific filters dynamically based on selected segment
    // Only filter if specific values are selected, otherwise show all segment values
    if (filters.segment === 'By Brand') {
      if (filters.brand && filters.brand.length > 0) {
        filtered = filtered.filter(d => filters.brand!.includes(d.brand))
      }
    } else if (filters.segment === 'By Age') {
      if (filters.ageGroup && filters.ageGroup.length > 0) {
        filtered = filtered.filter(d => filters.ageGroup!.includes(d.ageGroup))
      }
    } else if (filters.segment === 'By Gender') {
      if (filters.gender && filters.gender.length > 0) {
        filtered = filtered.filter(d => filters.gender!.includes(d.gender))
      }
      } else if (filters.segment === 'By ROA') {
      if (filters.roa && filters.roa.length > 0) {
        filtered = filtered.filter(d => filters.roa!.includes(d.roa))
      }
      } else if (filters.segment === 'By FDF') {
      if (filters.dosageForm && filters.dosageForm.length > 0) {
        filtered = filtered.filter(d => filters.dosageForm!.includes(d.fdf))
      }
    } else if (filters.segment === 'By Procurement') {
      if (filters.procurementType && filters.procurementType.length > 0) {
        filtered = filtered.filter(d => filters.procurementType!.includes(d.publicPrivate))
      }
    }
    
    return filtered
    } catch (error) {
      console.error('Error filtering data:', error)
      return []
    }
  }, [data, filters])

  // Get unique options based on filtered data (dynamic based on segment selection)
  const uniqueOptions = useMemo(() => {
    try {
      if (!data || data.length === 0) {
        return {
          years: [],
          diseases: [],
          countries: [],
          brands: [],
          ageGroups: [],
          genders: [],
          roaTypes: [],
          fdfTypes: [],
          procurementTypes: [],
        }
      }
      
    // Base filters always use full dataset
      let baseData: any[] = []
      try {
        baseData = filterDataframe(data, {
          year: filters.year && filters.year.length > 0 ? filters.year : undefined,
          disease: filters.vaccineType && filters.vaccineType.length > 0 ? filters.vaccineType : undefined,
          country: filters.country && filters.country.length > 0 ? filters.country : undefined,
    } as FilterOptions)
      } catch (error) {
        console.error('Error filtering base data:', error)
        baseData = data
      }
    
    // For segment-specific options, use filtered data to show only available options
    let segmentFilteredData = baseData
    
    // Apply segment-specific filters if they exist
    if (filters.segment === 'By Brand' && filters.brand && filters.brand.length > 0) {
      segmentFilteredData = segmentFilteredData.filter(d => filters.brand!.includes(d.brand))
    } else if (filters.segment === 'By Age' && filters.ageGroup && filters.ageGroup.length > 0) {
      segmentFilteredData = segmentFilteredData.filter(d => filters.ageGroup!.includes(d.ageGroup))
    } else if (filters.segment === 'By Gender' && filters.gender && filters.gender.length > 0) {
      segmentFilteredData = segmentFilteredData.filter(d => filters.gender!.includes(d.gender))
      } else if (filters.segment === 'By ROA' && filters.roa && filters.roa.length > 0) {
        segmentFilteredData = segmentFilteredData.filter(d => filters.roa!.includes(d.roa))
      } else if (filters.segment === 'By FDF') {
      if (filters.dosageForm && filters.dosageForm.length > 0) {
        segmentFilteredData = segmentFilteredData.filter(d => filters.dosageForm!.includes(d.fdf))
      }
    } else if (filters.segment === 'By Procurement' && filters.procurementType && filters.procurementType.length > 0) {
      segmentFilteredData = segmentFilteredData.filter(d => filters.procurementType!.includes(d.publicPrivate))
    }
    
    return {
      years: [...new Set(data.map(d => d.year))].sort(),
      diseases: [...new Set(data.map(d => d.disease))].sort(),
      countries: [...new Set(data.map(d => d.country))].sort(),
      // Segment-specific options filtered based on current selections
      brands: [...new Set(baseData.map(d => d.brand))].sort(),
      ageGroups: [...new Set(baseData.map(d => d.ageGroup))].sort(),
      genders: [...new Set(baseData.map(d => d.gender))].sort(),
      roaTypes: [...new Set(baseData.map(d => d.roa))].sort(),
      fdfTypes: [...new Set(baseData.map(d => d.fdf))].sort(),
      procurementTypes: [...new Set(baseData.map(d => d.publicPrivate))].sort(),
      }
    } catch (error) {
      console.error('Error calculating unique options:', error)
      return {
        years: [],
        diseases: [],
        countries: [],
        brands: [],
        ageGroups: [],
        genders: [],
        roaTypes: [],
        fdfTypes: [],
        procurementTypes: [],
      }
    }
  }, [data, filters])

  // Active filters label helper
  const activeFiltersLabel = useMemo(() => {
    return {
      year: filters.year && filters.year.length > 0 
        ? filters.year.join(', ') 
        : 'All Years',
      diseases: filters.vaccineType && filters.vaccineType.length > 0 
        ? filters.vaccineType 
        : [],
      countries: filters.country && filters.country.length > 0 
        ? filters.country.join(', ') 
        : 'All Countries',
      marketEvaluation: filters.marketEvaluation || 'By Value',
      segment: filters.segment || 'None',
    }
  }, [filters])

  // Get data value based on market evaluation type - MUST be defined before useMemo hooks that use it
  const getDataValue = (d: any): number => {
    if (filters.marketEvaluation === 'By Volume') {
      return d.volumeUnits || 0
    }
    return (d.marketValueUsd || 0) / 1000 // Convert to millions
  }

  const getDataLabel = (): string => {
    return filters.marketEvaluation === 'By Volume' ? 'Market Volume (Units)' : 'Market Value (US$ Million)'
  }

  // Graph 1: Market Value by Brand (grouped by Year)
  // X axis: Brand name, Y axis: Market Value, grouped by Year
  const marketValueByBrandData = useMemo(() => {
    const years = [...new Set(filteredData.map(d => d.year))].sort()
    const brands = [...new Set(filteredData.map(d => d.brand))].sort()
    
    if (years.length === 0 || brands.length === 0) return []
    
    return years.map((year) => {
      const entry: Record<string, number | string> = { year: String(year) }
      brands.forEach((brand) => {
        const yearData = filteredData.filter(d => d.year === year && d.brand === brand)
        entry[brand] = yearData.reduce((sum, d) => sum + getDataValue(d), 0)
      })
      return entry
    })
  }, [filteredData, filters.marketEvaluation])

  // Graph 2: Market Value by Country by Year
  // X axis: Country, Y axis: Market Value, grouped by Year
  const marketValueByCountryData = useMemo(() => {
    const years = [...new Set(filteredData.map(d => d.year))].sort()
    const countries = [...new Set(filteredData.map(d => d.country))].sort()
    
    if (years.length === 0 || countries.length === 0) return []
    
    return years.map((year) => {
      const entry: Record<string, number | string> = { year: String(year) }
      countries.forEach((country) => {
        const yearData = filteredData.filter(d => d.year === year && d.country === country)
        entry[country] = yearData.reduce((sum, d) => sum + getDataValue(d), 0)
      })
      return entry
    })
  }, [filteredData, filters.marketEvaluation])

  // Graph 3: Region chart showing percentage distribution of countries within each region
  const regionCountryPercentageData = useMemo(() => {
    const regionData: Record<string, Record<string, number>> = {}
    
    // Group data by region and country
    filteredData.forEach((d) => {
      if (!regionData[d.region]) {
        regionData[d.region] = {}
      }
      regionData[d.region][d.country] = (regionData[d.region][d.country] || 0) + getDataValue(d)
    })
    
    // Calculate percentages for each region
    return Object.entries(regionData).map(([region, countriesData]) => {
      const totalValue = Object.values(countriesData).reduce((sum, val) => sum + val, 0)
      const countries = Object.keys(countriesData).sort()
      
      return countries.map((country) => {
        const value = countriesData[country] || 0
        const percentage = totalValue > 0 ? ((value / totalValue) * 100) : 0
        
        return {
          region,
          country,
          value,
          percentage: parseFloat(percentage.toFixed(1))
        }
      })
    }).flat()
  }, [filteredData, filters.marketEvaluation])

  // Available cross-segments for standalone cross-analysis (exclude the primary cross-segment)
  const availableCrossSegmentsForStandalone = useMemo(() => {
    const allSegments: SegmentType[] = ['By Brand', 'By Age', 'By Gender', 'By ROA', 'By FDF', 'By Procurement']
    // Filter based on marketEvaluation: hide By Age and By Gender when By Volume is selected
    const filteredSegments = filters.marketEvaluation === 'By Volume'
      ? allSegments.filter(s => s !== 'By Age' && s !== 'By Gender')
      : allSegments
    return filteredSegments.filter(s => s !== filters.crossSegmentPrimary)
  }, [filters.crossSegmentPrimary, filters.marketEvaluation])

  // Standalone cross-segment filtered data (apply crossSegmentPrimary filters)
  const standaloneCrossSegmentFilteredData = useMemo(() => {
    if (!filters.crossSegmentPrimary) return filteredData
    
    let filtered = filteredData
    
    // Apply segment-specific filters for crossSegmentPrimary
    if (filters.crossSegmentPrimary === 'By Brand') {
      if (filters.crossSegmentPrimaryBrand && filters.crossSegmentPrimaryBrand.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentPrimaryBrand!.includes(d.brand))
      }
    } else if (filters.crossSegmentPrimary === 'By Age') {
      if (filters.crossSegmentPrimaryAgeGroup && filters.crossSegmentPrimaryAgeGroup.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentPrimaryAgeGroup!.includes(d.ageGroup))
      }
    } else if (filters.crossSegmentPrimary === 'By Gender') {
      if (filters.crossSegmentPrimaryGender && filters.crossSegmentPrimaryGender.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentPrimaryGender!.includes(d.gender))
      }
    } else if (filters.crossSegmentPrimary === 'By ROA') {
      if (filters.crossSegmentPrimaryRoa && filters.crossSegmentPrimaryRoa.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentPrimaryRoa!.includes(d.roa))
      }
    } else if (filters.crossSegmentPrimary === 'By FDF') {
      if (filters.crossSegmentPrimaryDosageForm && filters.crossSegmentPrimaryDosageForm.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentPrimaryDosageForm!.includes(d.fdf))
      }
    } else if (filters.crossSegmentPrimary === 'By Procurement') {
      if (filters.crossSegmentPrimaryProcurementType && filters.crossSegmentPrimaryProcurementType.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentPrimaryProcurementType!.includes(d.publicPrivate))
      }
    }
    
    return filtered
  }, [filteredData, filters.crossSegmentPrimary, filters.crossSegmentPrimaryBrand, filters.crossSegmentPrimaryAgeGroup, filters.crossSegmentPrimaryGender, filters.crossSegmentPrimaryRoa, filters.crossSegmentPrimaryDosageForm, filters.crossSegmentPrimaryProcurementType])

  // Standalone cross-segment analysis data - Individual level granularity
  // This creates data grouped by primary segment with cross-segment breakdown
  // Note: Currently not used but kept for potential future features
  const _standaloneCrossSegmentData = useMemo(() => {
    if (!filters.crossSegmentPrimary || !filters.crossSegment || filters.crossSegmentPrimary === filters.crossSegment) return []
    
    let filtered = standaloneCrossSegmentFilteredData
    
    // Apply cross-segment filters if they exist
    if (filters.crossSegment === 'By Brand') {
      if (filters.crossSegmentBrand && filters.crossSegmentBrand.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentBrand!.includes(d.brand))
      }
    } else if (filters.crossSegment === 'By Age') {
      if (filters.crossSegmentAgeGroup && filters.crossSegmentAgeGroup.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentAgeGroup!.includes(d.ageGroup))
      }
    }
    
    // Get keys for both segments
      let primarySegmentKey = ''
    if (filters.crossSegmentPrimary === 'By Brand') primarySegmentKey = 'brand'
    else if (filters.crossSegmentPrimary === 'By Age') primarySegmentKey = 'ageGroup'
    else if (filters.crossSegmentPrimary === 'By Gender') primarySegmentKey = 'gender'
    else if (filters.crossSegmentPrimary === 'By ROA') primarySegmentKey = 'roa'
    else if (filters.crossSegmentPrimary === 'By FDF') primarySegmentKey = 'fdf'
    else if (filters.crossSegmentPrimary === 'By Procurement') primarySegmentKey = 'publicPrivate'
      
      let crossSegmentKey = ''
      if (filters.crossSegment === 'By Brand') crossSegmentKey = 'brand'
      else if (filters.crossSegment === 'By Age') crossSegmentKey = 'ageGroup'
      else if (filters.crossSegment === 'By Gender') crossSegmentKey = 'gender'
    else if (filters.crossSegment === 'By ROA') crossSegmentKey = 'roa'
      else if (filters.crossSegment === 'By FDF') crossSegmentKey = 'fdf'
      else if (filters.crossSegment === 'By Procurement') crossSegmentKey = 'publicPrivate'
      
      if (!primarySegmentKey || !crossSegmentKey) return []
      
    // Get unique values for grouping
    const primaryValues = [...new Set(filtered.map(d => d[primarySegmentKey as keyof typeof d] as string))].sort()
    const crossValues = [...new Set(filtered.map(d => d[crossSegmentKey as keyof typeof d] as string))].sort()
    
    if (primaryValues.length === 0 || crossValues.length === 0) return []
    
    // Create granular data: Group by primary segment value, with cross-segment values as separate bars
    // X-axis: Primary segment values (e.g., Brand names)
    // Y-axis: Market Value
    // Groups: Years (each year shows bars for each cross-segment value)
    const years = [...new Set(filtered.map(d => d.year))].sort()
    
    return primaryValues.map((primaryValue) => {
      const entry: Record<string, number | string> = { 
        primarySegment: primaryValue 
      }
      
      // For each year, create a value for each cross-segment value
      years.forEach((year) => {
        crossValues.forEach((crossValue) => {
          const yearData = filtered.filter(d => 
                d.year === year && 
                d[primarySegmentKey as keyof typeof d] === primaryValue &&
                d[crossSegmentKey as keyof typeof d] === crossValue
              )
          // Store individual values - granular level
          const value = yearData.reduce((sum, d) => sum + getDataValue(d), 0)
          // Create key as "year-crossValue" for granular display
          entry[`${year}-${crossValue}`] = value
        })
      })
      
      return entry
    })
  }, [standaloneCrossSegmentFilteredData, filters.crossSegmentPrimary, filters.crossSegment, filters.crossSegmentBrand, filters.crossSegmentAgeGroup, filters.crossSegmentGender, filters.crossSegmentRoa, filters.crossSegmentDosageForm, filters.crossSegmentProcurementType, filters.marketEvaluation])

  // Get standalone cross-segment keys for chart - Individual granular keys
  // Used for secondary chart view (currently not displayed but kept for future use)
  const _standaloneCrossSegmentKeys = useMemo(() => {
    if (!filters.crossSegmentPrimary || !filters.crossSegment || filters.crossSegmentPrimary === filters.crossSegment) return []
    
    let filtered = standaloneCrossSegmentFilteredData
    
    // Apply cross-segment filters if they exist
    if (filters.crossSegment === 'By Brand') {
      if (filters.crossSegmentBrand && filters.crossSegmentBrand.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentBrand!.includes(d.brand))
      }
    } else if (filters.crossSegment === 'By Age') {
      if (filters.crossSegmentAgeGroup && filters.crossSegmentAgeGroup.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentAgeGroup!.includes(d.ageGroup))
      }
    } else if (filters.crossSegment === 'By Gender') {
      if (filters.crossSegmentGender && filters.crossSegmentGender.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentGender!.includes(d.gender))
      }
    } else if (filters.crossSegment === 'By ROA') {
      if (filters.crossSegmentRoa && filters.crossSegmentRoa.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentRoa!.includes(d.roa))
      }
    } else if (filters.crossSegment === 'By FDF') {
      if (filters.crossSegmentDosageForm && filters.crossSegmentDosageForm.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentDosageForm!.includes(d.fdf))
      }
    } else if (filters.crossSegment === 'By Procurement') {
      if (filters.crossSegmentProcurementType && filters.crossSegmentProcurementType.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentProcurementType!.includes(d.publicPrivate))
      }
    }
      
      let crossSegmentKey = ''
      if (filters.crossSegment === 'By Brand') crossSegmentKey = 'brand'
      else if (filters.crossSegment === 'By Age') crossSegmentKey = 'ageGroup'
      else if (filters.crossSegment === 'By Gender') crossSegmentKey = 'gender'
    else if (filters.crossSegment === 'By ROA') crossSegmentKey = 'roa'
      else if (filters.crossSegment === 'By FDF') crossSegmentKey = 'fdf'
      else if (filters.crossSegment === 'By Procurement') crossSegmentKey = 'publicPrivate'
      
    if (!crossSegmentKey) return []
    
    const years = [...new Set(filtered.map(d => d.year))].sort()
    const crossValues = [...new Set(filtered.map(d => d[crossSegmentKey as keyof typeof d] as string))].sort()
    
    // Create granular keys: "year-crossValue" for individual level display
      const combinations: string[] = []
    years.forEach((year) => {
        crossValues.forEach((crossValue) => {
        combinations.push(`${year}-${crossValue}`)
      })
    })
    
    return combinations
  }, [standaloneCrossSegmentFilteredData, filters.crossSegmentPrimary, filters.crossSegment, filters.crossSegmentBrand, filters.crossSegmentAgeGroup, filters.crossSegmentGender, filters.crossSegmentRoa, filters.crossSegmentDosageForm, filters.crossSegmentProcurementType])

  // Alternative: Grouped by primary segment, showing cross-segment values grouped by year
  const standaloneCrossSegmentGroupedData = useMemo(() => {
    if (!filters.crossSegmentPrimary || !filters.crossSegment || filters.crossSegmentPrimary === filters.crossSegment) return []
    
    let filtered = standaloneCrossSegmentFilteredData
    
    // Apply cross-segment filters if they exist
    if (filters.crossSegment === 'By Brand') {
      if (filters.crossSegmentBrand && filters.crossSegmentBrand.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentBrand!.includes(d.brand))
      }
    } else if (filters.crossSegment === 'By Age') {
      if (filters.crossSegmentAgeGroup && filters.crossSegmentAgeGroup.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentAgeGroup!.includes(d.ageGroup))
      }
    } else if (filters.crossSegment === 'By Gender') {
      if (filters.crossSegmentGender && filters.crossSegmentGender.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentGender!.includes(d.gender))
      }
    } else if (filters.crossSegment === 'By ROA') {
      if (filters.crossSegmentRoa && filters.crossSegmentRoa.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentRoa!.includes(d.roa))
      }
    } else if (filters.crossSegment === 'By FDF') {
      if (filters.crossSegmentDosageForm && filters.crossSegmentDosageForm.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentDosageForm!.includes(d.fdf))
      }
    } else if (filters.crossSegment === 'By Procurement') {
      if (filters.crossSegmentProcurementType && filters.crossSegmentProcurementType.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentProcurementType!.includes(d.publicPrivate))
      }
    }
    
        let primarySegmentKey = ''
    if (filters.crossSegmentPrimary === 'By Brand') primarySegmentKey = 'brand'
    else if (filters.crossSegmentPrimary === 'By Age') primarySegmentKey = 'ageGroup'
    else if (filters.crossSegmentPrimary === 'By Gender') primarySegmentKey = 'gender'
    else if (filters.crossSegmentPrimary === 'By ROA') primarySegmentKey = 'roa'
    else if (filters.crossSegmentPrimary === 'By FDF') primarySegmentKey = 'fdf'
    else if (filters.crossSegmentPrimary === 'By Procurement') primarySegmentKey = 'publicPrivate'
        
        let crossSegmentKey = ''
        if (filters.crossSegment === 'By Brand') crossSegmentKey = 'brand'
        else if (filters.crossSegment === 'By Age') crossSegmentKey = 'ageGroup'
        else if (filters.crossSegment === 'By Gender') crossSegmentKey = 'gender'
    else if (filters.crossSegment === 'By ROA') crossSegmentKey = 'roa'
        else if (filters.crossSegment === 'By FDF') crossSegmentKey = 'fdf'
        else if (filters.crossSegment === 'By Procurement') crossSegmentKey = 'publicPrivate'
        
    if (!primarySegmentKey || !crossSegmentKey) return []
    
    const primaryValues = [...new Set(filtered.map(d => d[primarySegmentKey as keyof typeof d] as string))].sort()
    const crossValues = [...new Set(filtered.map(d => d[crossSegmentKey as keyof typeof d] as string))].sort()
    const years = [...new Set(filtered.map(d => d.year))].sort()
    
    if (primaryValues.length === 0 || crossValues.length === 0 || years.length === 0) return []
    
    // Create data grouped by primary segment, with cross-segment values as separate series
    // Each year shows bars for each cross-segment value
    return years.map((year) => {
      const entry: Record<string, number | string> = { year: String(year) }
      
      primaryValues.forEach((primaryValue) => {
        crossValues.forEach((crossValue) => {
          const yearData = filtered.filter(d => 
            d.year === year && 
            d[primarySegmentKey as keyof typeof d] === primaryValue &&
            d[crossSegmentKey as keyof typeof d] === crossValue
          )
          // Key format: "primaryValue × crossValue" for individual granular display
          const combinedKey = `${primaryValue} × ${crossValue}`
          entry[combinedKey] = yearData.reduce((sum, d) => sum + getDataValue(d), 0)
        })
      })
      
      return entry
    })
  }, [standaloneCrossSegmentFilteredData, filters.crossSegmentPrimary, filters.crossSegment, filters.crossSegmentBrand, filters.crossSegmentAgeGroup, filters.crossSegmentGender, filters.crossSegmentRoa, filters.crossSegmentDosageForm, filters.crossSegmentProcurementType, filters.marketEvaluation])

  // Keys for grouped data chart
  const standaloneCrossSegmentGroupedKeys = useMemo(() => {
    if (!filters.crossSegmentPrimary || !filters.crossSegment || filters.crossSegmentPrimary === filters.crossSegment) return []
    
    let filtered = standaloneCrossSegmentFilteredData
    
    // Apply cross-segment filters if they exist
    if (filters.crossSegment === 'By Brand') {
      if (filters.crossSegmentBrand && filters.crossSegmentBrand.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentBrand!.includes(d.brand))
      }
    } else if (filters.crossSegment === 'By Age') {
      if (filters.crossSegmentAgeGroup && filters.crossSegmentAgeGroup.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentAgeGroup!.includes(d.ageGroup))
      }
    } else if (filters.crossSegment === 'By Gender') {
      if (filters.crossSegmentGender && filters.crossSegmentGender.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentGender!.includes(d.gender))
      }
    } else if (filters.crossSegment === 'By ROA') {
      if (filters.crossSegmentRoa && filters.crossSegmentRoa.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentRoa!.includes(d.roa))
      }
    } else if (filters.crossSegment === 'By FDF') {
      if (filters.crossSegmentDosageForm && filters.crossSegmentDosageForm.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentDosageForm!.includes(d.fdf))
      }
    } else if (filters.crossSegment === 'By Procurement') {
      if (filters.crossSegmentProcurementType && filters.crossSegmentProcurementType.length > 0) {
        filtered = filtered.filter(d => filters.crossSegmentProcurementType!.includes(d.publicPrivate))
      }
    }
    
      let primarySegmentKey = ''
    if (filters.crossSegmentPrimary === 'By Brand') primarySegmentKey = 'brand'
    else if (filters.crossSegmentPrimary === 'By Age') primarySegmentKey = 'ageGroup'
    else if (filters.crossSegmentPrimary === 'By Gender') primarySegmentKey = 'gender'
    else if (filters.crossSegmentPrimary === 'By ROA') primarySegmentKey = 'roa'
    else if (filters.crossSegmentPrimary === 'By FDF') primarySegmentKey = 'fdf'
    else if (filters.crossSegmentPrimary === 'By Procurement') primarySegmentKey = 'publicPrivate'
      
      let crossSegmentKey = ''
      if (filters.crossSegment === 'By Brand') crossSegmentKey = 'brand'
      else if (filters.crossSegment === 'By Age') crossSegmentKey = 'ageGroup'
      else if (filters.crossSegment === 'By Gender') crossSegmentKey = 'gender'
    else if (filters.crossSegment === 'By ROA') crossSegmentKey = 'roa'
      else if (filters.crossSegment === 'By FDF') crossSegmentKey = 'fdf'
      else if (filters.crossSegment === 'By Procurement') crossSegmentKey = 'publicPrivate'
      
      if (!primarySegmentKey || !crossSegmentKey) return []
      
    const primaryValues = [...new Set(filtered.map(d => d[primarySegmentKey as keyof typeof d] as string))].sort()
    const crossValues = [...new Set(filtered.map(d => d[crossSegmentKey as keyof typeof d] as string))].sort()
      
    // Create all combinations for granular display
      const combinations: string[] = []
      primaryValues.forEach((primaryValue) => {
        crossValues.forEach((crossValue) => {
          combinations.push(`${primaryValue} × ${crossValue}`)
        })
      })
      
    return combinations
  }, [standaloneCrossSegmentFilteredData, filters.crossSegmentPrimary, filters.crossSegment, filters.crossSegmentBrand, filters.crossSegmentAgeGroup, filters.crossSegmentGender, filters.crossSegmentRoa, filters.crossSegmentDosageForm, filters.crossSegmentProcurementType])

  // KPIs
  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalValue: 'N/A',
        avgValue: 'N/A',
        topSegment: 'N/A',
        yoyGrowth: 'N/A',
      }
    }

    const totalValue = filteredData.reduce((sum, d) => sum + getDataValue(d), 0)
    const avgValue = totalValue / filteredData.length
    
    // Get top segment based on selected segment type
    let topSegment = 'N/A'
    if (filters.segment === 'By Brand') {
      const brandGroups = filteredData.reduce((acc: Record<string, number>, d) => {
        acc[d.brand] = (acc[d.brand] || 0) + getDataValue(d)
        return acc
      }, {})
      topSegment = Object.entries(brandGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    } else if (filters.segment === 'By Age') {
      const ageGroups = filteredData.reduce((acc: Record<string, number>, d) => {
        acc[d.ageGroup] = (acc[d.ageGroup] || 0) + getDataValue(d)
        return acc
      }, {})
      topSegment = Object.entries(ageGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    } else if (filters.segment === 'By Gender') {
      const genderGroups = filteredData.reduce((acc: Record<string, number>, d) => {
        acc[d.gender] = (acc[d.gender] || 0) + getDataValue(d)
        return acc
      }, {})
      topSegment = Object.entries(genderGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    } else if (filters.segment === 'By ROA') {
      const roaGroups = filteredData.reduce((acc: Record<string, number>, d) => {
        acc[d.roa] = (acc[d.roa] || 0) + getDataValue(d)
        return acc
      }, {})
      topSegment = Object.entries(roaGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    }

    // Calculate YoY Growth
    const years = [...new Set(filteredData.map(d => d.year))].sort()
    let yoyGrowth = 0
    if (years.length >= 2) {
      const latestYear = years[years.length - 1]
      const prevYear = years[years.length - 2]
      const latestValue = filteredData.filter(d => d.year === latestYear).reduce((sum, d) => sum + getDataValue(d), 0)
      const prevValue = filteredData.filter(d => d.year === prevYear).reduce((sum, d) => sum + getDataValue(d), 0)
      yoyGrowth = prevValue > 0 ? ((latestValue - prevValue) / prevValue) * 100 : 0
    }

    return {
      totalValue: filters.marketEvaluation === 'By Volume' 
        ? `${formatWithCommas(totalValue / 1000, 1)}K Units`
        : `${formatWithCommas(totalValue, 1)}M`,
      avgValue: filters.marketEvaluation === 'By Volume'
        ? `${formatWithCommas(avgValue, 1)} Units`
        : `${formatWithCommas(avgValue, 1)}M`,
      topSegment,
      yoyGrowth: `${yoyGrowth > 0 ? '+' : ''}${formatWithCommas(yoyGrowth, 1)}%`,
    }
  }, [filteredData, filters.marketEvaluation, filters.segment])

  const updateFilter = (key: keyof MarketAnalysisFilters, value: any) => {
    let normalizedValue: any
    
    // Handle year separately - convert strings to numbers
    if (key === 'year') {
      normalizedValue = Array.isArray(value) 
        ? value.map(v => Number(v))
        : [Number(value)]
    } else {
      normalizedValue = Array.isArray(value) 
      ? value.map(v => String(v))
      : String(value)
    }
    
    const newFilters = { ...filters, [key]: normalizedValue }
    
    // Auto-select "By Brand" segment when vaccineType is selected
    if (key === 'vaccineType' && Array.isArray(normalizedValue) && normalizedValue.length > 0) {
      newFilters.segment = 'By Brand'
      
      // Get available brands for the selected vaccine types
      const baseData = filterDataframe(data, {
        year: newFilters.year,
        disease: normalizedValue,
        country: newFilters.country,
      } as FilterOptions)
      const availableBrands = [...new Set(baseData.map(d => d.brand))].sort()
      
      // Ensure at least 2 brands are selected
      if (!newFilters.brand || newFilters.brand.length < 2) {
        if (availableBrands.length >= 2) {
          newFilters.brand = availableBrands.slice(0, 2)
        } else if (availableBrands.length === 1) {
          newFilters.brand = [availableBrands[0]]
        } else {
          newFilters.brand = []
        }
      } else {
        // Keep only brands that are still available
        const validBrands = newFilters.brand.filter(b => availableBrands.includes(b))
        if (validBrands.length < 2 && availableBrands.length >= 2) {
          // If we have less than 2 valid brands, add more to reach at least 2
          const neededBrands = availableBrands.filter(b => !validBrands.includes(b)).slice(0, 2 - validBrands.length)
          newFilters.brand = [...validBrands, ...neededBrands].slice(0, Math.max(2, validBrands.length + neededBrands.length))
        } else if (validBrands.length > 0) {
          newFilters.brand = validBrands
        } else if (availableBrands.length >= 2) {
          newFilters.brand = availableBrands.slice(0, 2)
        } else {
          newFilters.brand = availableBrands.slice(0, 1)
        }
      }
    }
    
    // Prevent clearing the last item in each filter category
    if (key === 'year' && Array.isArray(normalizedValue) && normalizedValue.length === 0 && uniqueOptions.years.length > 0) {
      const defaultYear = uniqueOptions.years.includes(2025) 
        ? 2025 
        : uniqueOptions.years[uniqueOptions.years.length - 1]
      newFilters.year = [defaultYear]
    } else if (key === 'vaccineType' && Array.isArray(normalizedValue) && normalizedValue.length === 0 && uniqueOptions.diseases.length > 0) {
      newFilters.vaccineType = [uniqueOptions.diseases[0]]
    } else if (key === 'country' && Array.isArray(normalizedValue) && normalizedValue.length === 0 && uniqueOptions.countries.length > 0) {
      newFilters.country = [uniqueOptions.countries[0]]
    }
    
    // Final safety check
    if (!newFilters.year || !Array.isArray(newFilters.year) || newFilters.year.length === 0) {
      if (uniqueOptions.years.length > 0) {
      const defaultYear = uniqueOptions.years.includes(2025) 
          ? 2025 
          : uniqueOptions.years[uniqueOptions.years.length - 1]
      newFilters.year = [defaultYear]
    }
    }
    if (!newFilters.vaccineType || !Array.isArray(newFilters.vaccineType) || newFilters.vaccineType.length === 0) {
      if (uniqueOptions.diseases.length > 0) {
      newFilters.vaccineType = [uniqueOptions.diseases[0]]
    }
    }
    if (!newFilters.country || !Array.isArray(newFilters.country) || newFilters.country.length === 0) {
      if (uniqueOptions.countries.length > 0) {
      newFilters.country = [uniqueOptions.countries[0]]
      }
    }
    
    setFilters(newFilters)
  }

  const updateMarketEvaluation = (value: MarketEvaluationType) => {
    const newFilters = { ...filters, marketEvaluation: value }
    
    // When switching to "By Volume", clear By Age and By Gender selections
    if (value === 'By Volume') {
      // Clear cross-segment primary if it's By Age or By Gender
      if (newFilters.crossSegmentPrimary === 'By Age' || newFilters.crossSegmentPrimary === 'By Gender') {
        delete newFilters.crossSegmentPrimary
        delete newFilters.crossSegmentPrimaryAgeGroup
        delete newFilters.crossSegmentPrimaryGender
      }
      // Clear cross-segment if it's By Age or By Gender
      if (newFilters.crossSegment === 'By Age' || newFilters.crossSegment === 'By Gender') {
        delete newFilters.crossSegment
        delete newFilters.crossSegmentAgeGroup
        delete newFilters.crossSegmentGender
      }
    }
    
    setFilters(newFilters)
  }

  const updateSegment = (value: SegmentType) => {
    const newFilters = { ...filters, segment: value }
    
    // Clear segment-specific filters when changing segment
    if (value !== 'By Brand') {
      delete newFilters.brand
    }
    if (value !== 'By Age') {
      delete newFilters.ageGroup
    }
    if (value !== 'By Gender') {
      delete newFilters.gender
    }
    if (value !== 'By ROA') {
      delete newFilters.roa
    }
    if (value !== 'By FDF') {
      delete newFilters.dosageForm
    }
    if (value !== 'By Procurement') {
      delete newFilters.procurementType
    }
    
    // Auto-select defaults based on segment type
    if (value === 'By Brand' && (!newFilters.brand || newFilters.brand.length < 2)) {
      // If switching to "By Brand", ensure at least 2 brands are selected
      const baseData = filterDataframe(data, {
        year: newFilters.year,
        disease: newFilters.vaccineType,
        country: newFilters.country,
      } as FilterOptions)
      const availableBrands = [...new Set(baseData.map(d => d.brand))].sort()
      if (availableBrands.length >= 2) {
        newFilters.brand = availableBrands.slice(0, 2)
      } else if (availableBrands.length === 1) {
        newFilters.brand = [availableBrands[0]]
      } else {
        newFilters.brand = []
      }
    } else if (value === 'By Procurement') {
      // Auto-select both Public and Private by default
      const baseData = filterDataframe(data, {
        year: newFilters.year,
        disease: newFilters.vaccineType,
        country: newFilters.country,
      } as FilterOptions)
      const availableProcurementTypes = [...new Set(baseData.map(d => d.publicPrivate))].sort()
      newFilters.procurementType = availableProcurementTypes
    }
    
    // Reset cross-segment when main segment changes
    if (value === null || value === filters.segment) {
      // Keep cross-segment if same segment or clearing segment
    } else {
      // Clear cross-segment when changing main segment
      delete newFilters.crossSegment
    }
    
    setFilters(newFilters)
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('Home')}
          className="flex items-center gap-2 px-5 py-2.5 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <InfoTooltip content="• Provides insights into market value and volume analysis\n• Analyze data by segments, countries, and years (granular view)\n• Use filters to explore market trends\n• Charts show market value (US$ Million) or volume (Units) by selected segments\n• Understand market dynamics at granular level">
          <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 cursor-help">
            Market Analysis
          </h1>
        </InfoTooltip>
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
          Market value and volume analysis by segments, countries, and years
        </p>
      </motion.div>

      {!data || data.length === 0 ? (
        <div className={`p-8 rounded-2xl shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
          <div className="text-center py-12">
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-4">
              No data available. Please check the data source.
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              If this issue persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      ) : (
        <>
      <DemoNotice />

      {/* Filters Section */}
      <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
            <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Filter Data
            </h3>
          </div>
          <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
            Select filters to analyze market data. Changes will update all charts below.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <FilterDropdown
            label="Year"
            value={(filters.year || []).map(y => String(y))}
            onChange={(value) => updateFilter('year', value)}
            options={uniqueOptions.years.map(y => String(y))}
          />
          <FilterDropdown
            label="Vaccine Type"
            value={filters.vaccineType || []}
            onChange={(value) => updateFilter('vaccineType', value)}
            options={uniqueOptions.diseases}
          />
          <FilterDropdown
            label="Country"
            value={filters.country || []}
            onChange={(value) => updateFilter('country', value)}
            options={uniqueOptions.countries}
          />
          
          {/* Market Evaluation Dropdown */}
          <div className="w-full">
            <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
              Market Evaluation
            </label>
            <select
              value={filters.marketEvaluation || 'By Value'}
              onChange={(e) => updateMarketEvaluation(e.target.value as MarketEvaluationType)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-navy-card border-navy-light text-text-primary-dark hover:border-electric-blue' 
                  : 'bg-white border-gray-300 text-text-primary-light hover:border-electric-blue'
              } focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all`}
            >
              <option value="By Value">By Value</option>
              <option value="By Volume">By Volume</option>
            </select>
          </div>
        </div>

        {/* Segment Filter - Fixed to "By Brand" */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
            Segment
          </label>
          <div className={`w-full max-w-md px-4 py-2 rounded-lg border ${
              isDark 
              ? 'bg-navy-dark border-navy-light text-text-primary-dark' 
              : 'bg-gray-50 border-gray-300 text-text-primary-light'
          }`}>
            By Brand
        </div>
          </div>

        {/* Conditional Sub-filters - Dynamic based on selected segment */}
        {filters.segment === 'By Brand' && (
          <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
            <FilterDropdown
              label="Brand (Minimum 2 required)"
              value={(filters.brand || []) as string[]}
              onChange={(value) => {
                // Enforce minimum 2 brands - mandatory requirement
                if (!Array.isArray(value)) return
                
                const brandValues = value as string[]
                const currentBrands = (filters.brand || []) as string[]
                
                // If trying to deselect and would go below 2, prevent it
                if (brandValues.length < 2 && uniqueOptions.brands.length >= 2) {
                  // Keep at least 2 brands - don't allow going below 2
                  if (currentBrands.length >= 2) {
                    // Try to preserve existing selections, but ensure at least 2 remain
                    const newBrands = brandValues.filter(b => currentBrands.includes(b))
                    if (newBrands.length >= 2) {
                      setFilters({ ...filters, brand: newBrands })
                    } else {
                      // If deselecting would drop below 2, keep the first 2 current brands
                      setFilters({ ...filters, brand: currentBrands.slice(0, 2) })
                    }
                  } else {
                    // Current brands < 2, add more to reach minimum 2
                    const availableBrands = uniqueOptions.brands.filter(b => !currentBrands.includes(b))
                    const neededBrands = availableBrands.slice(0, Math.max(0, 2 - currentBrands.length))
                    setFilters({ ...filters, brand: [...currentBrands, ...neededBrands].slice(0, 2) })
                  }
                } else if (brandValues.length >= 2) {
                  // At least 2 selected - allow the change
                  setFilters({ ...filters, brand: brandValues })
                } else if (brandValues.length === 1 && uniqueOptions.brands.length === 1) {
                  // Only allow if there's only 1 brand available total
                  setFilters({ ...filters, brand: brandValues })
                } else if (brandValues.length > 0 && brandValues.length < 2 && uniqueOptions.brands.length >= 2) {
                  // Selecting but less than 2 - add more to reach minimum 2
                  const availableBrands = uniqueOptions.brands.filter(b => !brandValues.includes(b))
                  const neededBrands = availableBrands.slice(0, 2 - brandValues.length)
                  setFilters({ ...filters, brand: [...brandValues, ...neededBrands].slice(0, 2) })
                }
              }}
              options={uniqueOptions.brands}
            />
          </div>
        )}

        {filters.segment === 'By Age' && (
          <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
            <FilterDropdown
              label="Age Group"
              value={(filters.ageGroup || []) as string[]}
              onChange={(value) => setFilters({ ...filters, ageGroup: value as string[] })}
              options={uniqueOptions.ageGroups}
            />
          </div>
        )}

        {filters.segment === 'By Gender' && (
          <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
            <FilterDropdown
              label="Gender"
              value={(filters.gender || []) as string[]}
              onChange={(value) => setFilters({ ...filters, gender: value as string[] })}
              options={uniqueOptions.genders}
            />
          </div>
        )}

        {filters.segment === 'By ROA' && (
          <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
            <FilterDropdown
              label="ROA"
              value={(filters.roa || []) as string[]}
              onChange={(value) => setFilters({ ...filters, roa: value as string[] })}
              options={uniqueOptions.roaTypes}
            />
          </div>
        )}

        {filters.segment === 'By FDF' && (
          <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
            <FilterDropdown
              label="Dosage Form"
              value={(filters.dosageForm || []) as string[]}
              onChange={(value) => setFilters({ ...filters, dosageForm: value as string[] })}
              options={uniqueOptions.fdfTypes}
            />
          </div>
        )}

        {filters.segment === 'By Procurement' && (
          <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
            <FilterDropdown
              label="Procurement Type"
              value={(filters.procurementType || []) as string[]}
              onChange={(value) => setFilters({ ...filters, procurementType: value as string[] })}
              options={uniqueOptions.procurementTypes}
            />
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.year && filters.year.length > 0 || filters.vaccineType && filters.vaccineType.length > 0 || filters.country && filters.country.length > 0) && (
          <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-navy-light">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-navy-dark' : 'bg-blue-50'}`}>
              <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                Currently Viewing:
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Year:</span>
                  <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">{activeFiltersLabel.year}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Vaccine Type:</span>
                  <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">{Array.isArray(activeFiltersLabel.diseases) ? activeFiltersLabel.diseases.join(', ') : activeFiltersLabel.diseases}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Countries:</span>
                  <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">{activeFiltersLabel.countries}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Evaluation:</span>
                  <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">{activeFiltersLabel.marketEvaluation}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Segment:</span>
                  <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">{activeFiltersLabel.segment}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="mb-10">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Key Metrics
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.totalValue}
              subtitle={`Total ${filters.marketEvaluation === 'By Volume' ? 'Volume' : 'Market Value'}`}
            />
          </div>
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.avgValue}
              subtitle={`Average ${filters.marketEvaluation === 'By Volume' ? 'Volume' : 'Value'}`}
            />
          </div>
        </div>
      </div>

      {/* Graph 1: Market Value by Brand (grouped by Year) */}
      {marketValueByBrandData.length > 0 && (() => {
        const brands = [...new Set(filteredData.map(d => d.brand))].sort()
        
        return (
        <div className="mb-20">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market value'} by brand grouped by year\n• X-axis: Brand name\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Value'}\n• Compare brand performance across years`}>
                <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                    {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Value'} by Brand
                </h2>
              </InfoTooltip>
            </div>
            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                Brand performance comparison by year
            </p>
          </div>
          <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
              <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                  {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Value'} Performance by Year
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {getDataLabel()}
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                <SegmentGroupedBarChart
                  data={marketValueByBrandData.map((entry) => ({
                    year: entry.year,
                    ...brands.reduce((acc, brand) => {
                      acc[brand] = entry[brand] as number || 0
                      return acc
                    }, {} as Record<string, number>)
                  }))}
                  segmentKeys={brands}
                  xAxisLabel="Year"
                  yAxisLabel={getDataLabel()}
                />
            </div>
          </div>
        </div>
        )
      })()}

      {/* Graph 2: Market Value by Country by Year */}
      {marketValueByCountryData.length > 0 && (() => {
        const countries = [...new Set(filteredData.map(d => d.country))].sort()
        
        return (
        <div className="mb-20">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market value'} by country grouped by year\n• X-axis: Country\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Value'}\n• Compare country performance across years`}>
                <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                    {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Value'} by Country by Year
                </h2>
              </InfoTooltip>
            </div>
            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
              Country-wise breakdown grouped by year
            </p>
          </div>
          <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
              <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                  {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Value'} Performance by Year
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {getDataLabel()}
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                <SegmentGroupedBarChart
                  data={marketValueByCountryData.map((entry) => ({
                    year: entry.year,
                    ...countries.reduce((acc, country) => {
                      acc[country] = entry[country] as number || 0
                      return acc
                    }, {} as Record<string, number>)
                  }))}
                  segmentKeys={countries}
                xAxisLabel="Year"
                yAxisLabel={getDataLabel()}
              />
            </div>
          </div>
        </div>
        )
      })()}

      {/* Graph 3: Region chart showing percentage distribution of countries within each region */}
      {regionCountryPercentageData.length > 0 && (() => {
        return (
          <div className="mb-20">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                <InfoTooltip content={`• Shows percentage distribution of countries within each region\n• Each region shows what percentage each country contributes\n• Compare regional market share distribution`}>
                <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                    {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Value'} by Region & Country
                </h2>
              </InfoTooltip>
            </div>
              {filters.marketEvaluation === 'By Value' && (
            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Percentage distribution of countries within each region
                </p>
              )}
            </div>
            <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                  Regional Distribution
                </h3>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                <RegionCountryStackedBarChart
                  data={regionCountryPercentageData.map(d => ({
                    region: d.region,
                    country: d.country,
                    value: filters.marketEvaluation === 'By Volume' ? d.value : d.percentage
                  }))}
                  dataKey="value"
                  xAxisLabel="Region"
                  yAxisLabel={filters.marketEvaluation === 'By Volume' ? 'Volume (Units)' : 'Percentage (%)'}
                  showPercentage={filters.marketEvaluation === 'By Value'}
                />
              </div>
            </div>
          </div>
        )
      })()}

      {/* Cross Segment Analysis Section */}
        <div className="mb-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
            <InfoTooltip content="• Analyze data across two different segments\n• Select a primary segment and a cross segment\n• View how segments interact with each other">
                <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                Cross Segment Analysis
                </h2>
              </InfoTooltip>
            </div>
            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
            Analyze relationships between different segments
            </p>
          </div>

        {/* Cross Segment Filters */}
        <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
              <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                Cross Segment Filters
              </h3>
            </div>
            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
              Select two segments to analyze their relationship.
              </p>
            </div>
          
          {/* Two Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* First Filter: Primary Segment Selector */}
            <div className="w-full">
              <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                Segment
              </label>
              <select
                value={filters.crossSegmentPrimary || ''}
                onChange={(e) => {
                  const newPrimary = e.target.value as SegmentType || undefined
                  const newFilters: MarketAnalysisFilters = { ...filters, crossSegmentPrimary: newPrimary }
                  
                  // Clear cross-segment if it matches the new primary
                  if (newPrimary && filters.crossSegment === newPrimary) {
                    newFilters.crossSegment = undefined
                  }
                  
                  // Clear segment-specific filters when changing primary segment
                  delete newFilters.crossSegmentPrimaryBrand
                  delete newFilters.crossSegmentPrimaryAgeGroup
                  delete newFilters.crossSegmentPrimaryGender
                  delete newFilters.crossSegmentPrimaryRoa
                  delete newFilters.crossSegmentPrimaryDosageForm
                  delete newFilters.crossSegmentPrimaryProcurementType
                  
                  // Auto-populate defaults if needed
                  if (newPrimary === 'By Brand') {
                    const baseData = filterDataframe(data, {
                      year: filters.year && filters.year.length > 0 ? filters.year : undefined,
                      disease: filters.vaccineType && filters.vaccineType.length > 0 ? filters.vaccineType : undefined,
                      country: filters.country && filters.country.length > 0 ? filters.country : undefined,
                    } as FilterOptions)
                    const availableBrands = [...new Set(baseData.map(d => d.brand))].sort()
                    if (availableBrands.length >= 2) {
                      newFilters.crossSegmentPrimaryBrand = availableBrands.slice(0, 2)
                    } else if (availableBrands.length === 1) {
                      newFilters.crossSegmentPrimaryBrand = [availableBrands[0]]
                    }
                  } else if (newPrimary === 'By Age') {
                    const baseData = filterDataframe(data, {
                      year: filters.year && filters.year.length > 0 ? filters.year : undefined,
                      disease: filters.vaccineType && filters.vaccineType.length > 0 ? filters.vaccineType : undefined,
                      country: filters.country && filters.country.length > 0 ? filters.country : undefined,
                    } as FilterOptions)
                    const availableAgeGroups = [...new Set(baseData.map(d => d.ageGroup))].sort()
                    newFilters.crossSegmentPrimaryAgeGroup = availableAgeGroups
                  } else if (newPrimary === 'By Gender') {
                    const baseData = filterDataframe(data, {
                      year: filters.year && filters.year.length > 0 ? filters.year : undefined,
                      disease: filters.vaccineType && filters.vaccineType.length > 0 ? filters.vaccineType : undefined,
                      country: filters.country && filters.country.length > 0 ? filters.country : undefined,
                    } as FilterOptions)
                    const availableGenders = [...new Set(baseData.map(d => d.gender))].sort()
                    newFilters.crossSegmentPrimaryGender = availableGenders
                  } else if (newPrimary === 'By ROA') {
                    const baseData = filterDataframe(data, {
                      year: filters.year && filters.year.length > 0 ? filters.year : undefined,
                      disease: filters.vaccineType && filters.vaccineType.length > 0 ? filters.vaccineType : undefined,
                      country: filters.country && filters.country.length > 0 ? filters.country : undefined,
                    } as FilterOptions)
                    const availableRoa = [...new Set(baseData.map(d => d.roa))].sort()
                    newFilters.crossSegmentPrimaryRoa = availableRoa
                  } else if (newPrimary === 'By FDF') {
                    const baseData = filterDataframe(data, {
                      year: filters.year && filters.year.length > 0 ? filters.year : undefined,
                      disease: filters.vaccineType && filters.vaccineType.length > 0 ? filters.vaccineType : undefined,
                      country: filters.country && filters.country.length > 0 ? filters.country : undefined,
                    } as FilterOptions)
                    const availableFdf = [...new Set(baseData.map(d => d.fdf))].sort()
                    newFilters.crossSegmentPrimaryDosageForm = availableFdf
                  } else if (newPrimary === 'By Procurement') {
                    const baseData = filterDataframe(data, {
                      year: filters.year && filters.year.length > 0 ? filters.year : undefined,
                      disease: filters.vaccineType && filters.vaccineType.length > 0 ? filters.vaccineType : undefined,
                      country: filters.country && filters.country.length > 0 ? filters.country : undefined,
                    } as FilterOptions)
                    const availableProcurementTypes = [...new Set(baseData.map(d => d.publicPrivate))].sort()
                    newFilters.crossSegmentPrimaryProcurementType = availableProcurementTypes
                  }
                  
                  setFilters(newFilters)
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-navy-card border-navy-light text-text-primary-dark hover:border-electric-blue' 
                    : 'bg-white border-gray-300 text-text-primary-light hover:border-electric-blue'
                } focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all`}
              >
                <option value="">Select Segment</option>
                <option value="By Brand">By Brand</option>
                {filters.marketEvaluation === 'By Value' && (
                  <>
                    <option value="By Age">By Age</option>
                    <option value="By Gender">By Gender</option>
                  </>
                )}
                <option value="By ROA">By ROA</option>
                <option value="By FDF">By FDF</option>
                <option value="By Procurement">By Procurement</option>
              </select>
          </div>

            {/* Second Filter: Cross Segment */}
            <div className="w-full">
              <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                Cross Segment{filters.crossSegmentPrimary ? ` (View ${filters.crossSegmentPrimary.replace('By ', '')} by:)` : ''}
              </label>
              <select
                value={filters.crossSegment || ''}
                onChange={(e) => {
                  const newCrossSegment = (e.target.value as SegmentType) || undefined
                  const newFilters: MarketAnalysisFilters = { ...filters, crossSegment: newCrossSegment }
                  
                  // Clear cross-segment specific filters when changing cross-segment
                  delete newFilters.crossSegmentBrand
                  delete newFilters.crossSegmentAgeGroup
                  delete newFilters.crossSegmentGender
                  delete newFilters.crossSegmentRoa
                  delete newFilters.crossSegmentDosageForm
                  delete newFilters.crossSegmentProcurementType
                  
                  // Auto-select all available options for the new cross-segment
                  if (newCrossSegment) {
                    const baseData = filterDataframe(data, {
                      year: filters.year && filters.year.length > 0 ? filters.year : undefined,
                      disease: filters.vaccineType && filters.vaccineType.length > 0 ? filters.vaccineType : undefined,
                      country: filters.country && filters.country.length > 0 ? filters.country : undefined,
                    } as FilterOptions)
                    
                    if (newCrossSegment === 'By Brand') {
                      const availableBrands = [...new Set(baseData.map(d => d.brand))].sort()
                      if (availableBrands.length >= 2) {
                        newFilters.crossSegmentBrand = availableBrands.slice(0, 2)
                      } else if (availableBrands.length === 1) {
                        newFilters.crossSegmentBrand = [availableBrands[0]]
                      }
                    } else if (newCrossSegment === 'By Age') {
                      const availableAgeGroups = [...new Set(baseData.map(d => d.ageGroup))].sort()
                      newFilters.crossSegmentAgeGroup = availableAgeGroups
                    } else if (newCrossSegment === 'By Gender') {
                      const availableGenders = [...new Set(baseData.map(d => d.gender))].sort()
                      newFilters.crossSegmentGender = availableGenders
                    } else if (newCrossSegment === 'By ROA') {
                      const availableRoa = [...new Set(baseData.map(d => d.roa))].sort()
                      newFilters.crossSegmentRoa = availableRoa
                    } else if (newCrossSegment === 'By FDF') {
                      const availableFdf = [...new Set(baseData.map(d => d.fdf))].sort()
                      newFilters.crossSegmentDosageForm = availableFdf
                    } else if (newCrossSegment === 'By Procurement') {
                      const availableProcurementTypes = [...new Set(baseData.map(d => d.publicPrivate))].sort()
                      newFilters.crossSegmentProcurementType = availableProcurementTypes
                    }
                  }
                  
                  setFilters(newFilters)
                }}
                disabled={!filters.crossSegmentPrimary}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-navy-card border-navy-light text-text-primary-dark hover:border-electric-blue' 
                    : 'bg-white border-gray-300 text-text-primary-light hover:border-electric-blue'
                } focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all ${!filters.crossSegmentPrimary ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Cross Segment</option>
                {availableCrossSegmentsForStandalone.map((segment) => (
                  <option key={segment || ''} value={segment || ''}>
                    {segment}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Segment-Specific Sub-Filters */}
          {filters.crossSegmentPrimary === 'By Brand' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Brand (Minimum 2 required)"
                value={(filters.crossSegmentPrimaryBrand || []) as string[]}
                onChange={(value) => {
                  if (!Array.isArray(value)) return
                  const brandValues = value as string[]
                  const currentBrands = (filters.crossSegmentPrimaryBrand || []) as string[]
                  
                  if (brandValues.length < 2 && uniqueOptions.brands.length >= 2) {
                    if (currentBrands.length >= 2) {
                      const newBrands = brandValues.filter(b => currentBrands.includes(b))
                      if (newBrands.length >= 2) {
                        setFilters({ ...filters, crossSegmentPrimaryBrand: newBrands })
                      } else {
                        setFilters({ ...filters, crossSegmentPrimaryBrand: currentBrands.slice(0, 2) })
                      }
                    } else {
                      const availableBrands = uniqueOptions.brands.filter(b => !currentBrands.includes(b))
                      const neededBrands = availableBrands.slice(0, Math.max(0, 2 - currentBrands.length))
                      setFilters({ ...filters, crossSegmentPrimaryBrand: [...currentBrands, ...neededBrands].slice(0, 2) })
                    }
                  } else if (brandValues.length >= 2) {
                    setFilters({ ...filters, crossSegmentPrimaryBrand: brandValues })
                  } else if (brandValues.length === 1 && uniqueOptions.brands.length === 1) {
                    setFilters({ ...filters, crossSegmentPrimaryBrand: brandValues })
                  } else if (brandValues.length > 0 && brandValues.length < 2 && uniqueOptions.brands.length >= 2) {
                    const availableBrands = uniqueOptions.brands.filter(b => !brandValues.includes(b))
                    const neededBrands = availableBrands.slice(0, 2 - brandValues.length)
                    setFilters({ ...filters, crossSegmentPrimaryBrand: [...brandValues, ...neededBrands].slice(0, 2) })
                  }
                }}
                options={uniqueOptions.brands}
              />
              </div>
            )}
          
          {filters.crossSegmentPrimary === 'By Age' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Age Group"
                value={(filters.crossSegmentPrimaryAgeGroup || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentPrimaryAgeGroup: value as string[] })}
                options={uniqueOptions.ageGroups}
              />
          </div>
          )}
          
          {filters.crossSegmentPrimary === 'By Gender' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Gender"
                value={(filters.crossSegmentPrimaryGender || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentPrimaryGender: value as string[] })}
                options={uniqueOptions.genders}
              />
                  </div>
          )}
          
          {filters.crossSegmentPrimary === 'By ROA' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="ROA"
                value={(filters.crossSegmentPrimaryRoa || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentPrimaryRoa: value as string[] })}
                options={uniqueOptions.roaTypes}
              />
                      </div>
                    )}
          
          {filters.crossSegmentPrimary === 'By FDF' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Dosage Form"
                value={(filters.crossSegmentPrimaryDosageForm || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentPrimaryDosageForm: value as string[] })}
                options={uniqueOptions.fdfTypes}
              />
                  </div>
          )}
          
          {filters.crossSegmentPrimary === 'By Procurement' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Procurement Type"
                value={(filters.crossSegmentPrimaryProcurementType || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentPrimaryProcurementType: value as string[] })}
                options={uniqueOptions.procurementTypes}
              />
                </div>
          )}

          {/* Cross Segment Sub-Filters */}
          {filters.crossSegment === 'By Brand' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Cross Segment Brand (Minimum 2 required)"
                value={(filters.crossSegmentBrand || []) as string[]}
                onChange={(value) => {
                  if (!Array.isArray(value)) return
                  const brandValues = value as string[]
                  const currentBrands = (filters.crossSegmentBrand || []) as string[]
                  
                  if (brandValues.length < 2 && uniqueOptions.brands.length >= 2) {
                    if (currentBrands.length >= 2) {
                      const newBrands = brandValues.filter(b => currentBrands.includes(b))
                      if (newBrands.length >= 2) {
                        setFilters({ ...filters, crossSegmentBrand: newBrands })
                      } else {
                        setFilters({ ...filters, crossSegmentBrand: currentBrands.slice(0, 2) })
                      }
                    } else {
                      const availableBrands = uniqueOptions.brands.filter(b => !currentBrands.includes(b))
                      const neededBrands = availableBrands.slice(0, Math.max(0, 2 - currentBrands.length))
                      setFilters({ ...filters, crossSegmentBrand: [...currentBrands, ...neededBrands].slice(0, 2) })
                    }
                  } else if (brandValues.length >= 2) {
                    setFilters({ ...filters, crossSegmentBrand: brandValues })
                  }
                }}
                options={uniqueOptions.brands}
              />
              </div>
          )}

          {filters.crossSegment === 'By Age' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Cross Segment Age Group"
                value={(filters.crossSegmentAgeGroup || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentAgeGroup: value as string[] })}
                options={uniqueOptions.ageGroups}
              />
            </div>
          )}

          {filters.crossSegment === 'By Gender' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Cross Segment Gender"
                value={(filters.crossSegmentGender || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentGender: value as string[] })}
                options={uniqueOptions.genders}
              />
            </div>
          )}

          {filters.crossSegment === 'By ROA' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Cross Segment ROA"
                value={(filters.crossSegmentRoa || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentRoa: value as string[] })}
                options={uniqueOptions.roaTypes}
              />
            </div>
          )}

          {filters.crossSegment === 'By FDF' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Cross Segment Dosage Form"
                value={(filters.crossSegmentDosageForm || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentDosageForm: value as string[] })}
                options={uniqueOptions.fdfTypes}
              />
                      </div>
          )}

          {filters.crossSegment === 'By Procurement' && (
            <div className="mb-6 pt-4 border-t border-gray-300 dark:border-navy-light">
              <FilterDropdown
                label="Cross Segment Procurement Type"
                value={(filters.crossSegmentProcurementType || []) as string[]}
                onChange={(value) => setFilters({ ...filters, crossSegmentProcurementType: value as string[] })}
                options={uniqueOptions.procurementTypes}
                        />
                      </div>
          )}
          
          {/* Analysis Status */}
          {filters.crossSegmentPrimary && filters.crossSegment && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-navy-dark' : 'bg-blue-50'}`}>
              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                Analyzing: <span className="text-electric-blue dark:text-cyan-accent">{filters.crossSegmentPrimary}</span> × <span className="text-electric-blue dark:text-cyan-accent">{filters.crossSegment}</span>
              </p>
                    </div>
          )}
                  </div>

        {/* Cross Segment Charts - Simplified and Explanatory */}
        {filters.crossSegmentPrimary && filters.crossSegment && standaloneCrossSegmentGroupedData.length > 0 && standaloneCrossSegmentGroupedKeys.length > 0 && (
          <div className="mb-20">
            <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                      <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                  {filters.crossSegmentPrimary.replace('By ', '')} × {filters.crossSegment.replace('By ', '')} Analysis
                      </h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {getDataLabel()} • Each bar shows individual combinations grouped by year
                      </p>
                    </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                <SegmentGroupedBarChart
                  data={standaloneCrossSegmentGroupedData.map((entry) => ({
                    year: entry.year,
                    ...standaloneCrossSegmentGroupedKeys.reduce((acc, key) => {
                      acc[key] = entry[key] as number || 0
                      return acc
                    }, {} as Record<string, number>)
                  }))}
                  segmentKeys={standaloneCrossSegmentGroupedKeys}
                  xAxisLabel="Year"
                  yAxisLabel={getDataLabel()}
                      />
                    </div>
                  </div>
                </div>
              )}
      </div>
            </>
      )}
    </div>
  )
}
