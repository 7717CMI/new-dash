interface VaccineData {
  recordId: number
  year: number
  region: string
  country: string
  incomeType: string
  disease: string
  market: string
  brand: string
  company: string
  ageGroup: string
  gender: string
  segment: string
  segmentBy: string
  roa: string
  fdf: string
  formulation: string
  procurement: string
  publicPrivate: string
  prevalence: number
  incidence: number
  vaccinationRate: number
  coverageRate: number
  price: number
  priceElasticity: number
  priceClass: string
  volumeUnits: number
  qty: number
  revenue: number
  marketValueUsd: number
  value: number
  marketSharePct: number
  share: number
  cagr: number
  yoyGrowth: number
  yoy: number
  efficacyPct: number
}

const generateComprehensiveData = (): VaccineData[] => {
  const years = Array.from({ length: 15 }, (_, i) => 2021 + i)
  const regions = ["North America", "Europe", "APAC", "Latin America", "Middle East", "Africa"]
  
  const diseases = ["HBV", "Herpes", "TCV", "HPV", "Influenza", "Pneumococcal", "MMR", "Rotavirus", 
                   "Meningococcal", "Varicella"]
  
  const brandMap: Record<string, string[]> = {
    "HBV": ["Engerix-B", "Heplisav-B", "Recombivax HB", "Twinrix"],
    "Herpes": ["Shingrix", "Zostavax"],
    "TCV": ["Typbar TCV", "Typhim Vi", "Vivotif"],
    "HPV": ["Gardasil 9", "Cervarix"],
    "Influenza": ["Fluzone", "Flucelvax", "FluMist", "Fluad"],
    "Pneumococcal": ["Prevnar 13", "Prevnar 20", "Pneumovax 23", "Synflorix"],
    "MMR": ["M-M-R II", "Priorix"],
    "Rotavirus": ["RotaTeq", "Rotarix"],
    "Meningococcal": ["Bexsero", "Trumenba", "MenACWY"],
    "Varicella": ["Varivax", "ProQuad"]
  }
  
  const companies = ["Pfizer", "GSK", "Merck", "Sanofi", "AstraZeneca", "Moderna", "Bharat Biotech", 
                     "Serum Institute"]
  
  const countryIncomeMap: Record<string, Record<string, string>> = {
    "North America": {
      "USA": "High Income", "Canada": "High Income", "Mexico": "Middle Income"
    },
    "Europe": {
      "Germany": "High Income", "UK": "High Income", "France": "High Income", 
      "Spain": "High Income", "Italy": "High Income", "Poland": "Middle Income",
      "Romania": "Middle Income"
    },
    "APAC": {
      "Japan": "High Income", "Australia": "High Income", "Singapore": "High Income",
      "China": "Middle Income", "India": "Middle Income", "Thailand": "Middle Income",
      "Pakistan": "Low Income", "Bangladesh": "Low Income", "Nepal": "Low Income"
    },
    "Latin America": {
      "Brazil": "Middle Income", "Argentina": "Middle Income", "Chile": "Middle Income", 
      "Colombia": "Middle Income", "Peru": "Middle Income"
    },
    "Middle East": {
      "UAE": "High Income", "Saudi Arabia": "High Income", "Israel": "High Income", 
      "Egypt": "Middle Income", "Iraq": "Middle Income"
    },
    "Africa": {
      "South Africa": "Middle Income", "Nigeria": "Low Income", "Kenya": "Low Income", 
      "Ethiopia": "Low Income", "Ghana": "Low Income"
    }
  }
  
  const ageGroups = ["Pediatric / Children / Adolescence", "Adult", "Geriatric"]
  const roaTypes = ["IM", "SC", "Oral", "Intranasal"]
  const fdfTypes = ["Vial", "Prefilled Syringe", "Multi-dose Vial", "Oral Solution"]
  const procurementTypes = ["UNICEF", "GAVI", "PAHO", "Hospital", "Private Clinic", "Government"]
  
  // Disease-specific multipliers for variation
  const diseaseMultipliers: Record<string, { prevalence: number; incidence: number; price: number; cagr: number }> = {
    'HBV': { prevalence: 1.2, incidence: 0.9, price: 1.3, cagr: 1.1 },
    'Herpes': { prevalence: 0.8, incidence: 1.1, price: 1.5, cagr: 0.9 },
    'TCV': { prevalence: 1.5, incidence: 1.3, price: 0.7, cagr: 1.4 },
    'HPV': { prevalence: 1.1, incidence: 0.8, price: 1.2, cagr: 1.2 },
    'Influenza': { prevalence: 1.4, incidence: 1.6, price: 0.8, cagr: 1.0 },
    'Pneumococcal': { prevalence: 1.3, incidence: 1.2, price: 1.4, cagr: 1.3 },
    'MMR': { prevalence: 0.9, incidence: 0.7, price: 0.9, cagr: 0.8 },
    'Rotavirus': { prevalence: 1.6, incidence: 1.4, price: 0.6, cagr: 1.5 },
    'Meningococcal': { prevalence: 0.7, incidence: 1.0, price: 1.6, cagr: 1.1 },
    'Varicella': { prevalence: 1.0, incidence: 0.9, price: 1.1, cagr: 0.9 }
  }

  // Region-specific multipliers
  const regionMultipliers: Record<string, { volume: number; vaccinationRate: number; marketShare: number }> = {
    'North America': { volume: 1.5, vaccinationRate: 1.2, marketShare: 1.4 },
    'Europe': { volume: 1.3, vaccinationRate: 1.1, marketShare: 1.3 },
    'APAC': { volume: 1.8, vaccinationRate: 0.9, marketShare: 1.5 },
    'Latin America': { volume: 1.1, vaccinationRate: 0.8, marketShare: 0.9 },
    'Middle East': { volume: 0.9, vaccinationRate: 0.9, marketShare: 1.1 },
    'Africa': { volume: 1.2, vaccinationRate: 0.7, marketShare: 0.8 }
  }

  // Brand-specific multipliers (some brands are premium, some are budget)
  const brandPremiumMap: Record<string, number> = {}
  Object.values(brandMap).flat().forEach((brand, idx) => {
    brandPremiumMap[brand] = 0.8 + (idx % 3) * 0.4 // Creates 3 tiers: 0.8, 1.2, 1.6
  })

  const data: VaccineData[] = []
  let recordId = 100000
  
  let seed = 42
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  
  for (const year of years) {
    for (const region of regions) {
      const regionMult = regionMultipliers[region]
      for (const [country, incomeType] of Object.entries(countryIncomeMap[region])) {
        for (const disease of diseases) {
          const diseaseMult = diseaseMultipliers[disease]
          const brands = brandMap[disease]
          for (const brand of brands) {
            const brandMult = brandPremiumMap[brand] || 1.0
            for (const ageGroup of ageGroups) {
              // Age group multipliers
              const ageMult = ageGroup === 'Pediatric / Children / Adolescence' ? 1.3 : ageGroup === 'Geriatric' ? 1.1 : 1.0
              for (const gender of ["Male", "Female"]) {
                // Gender multiplier (slight variation)
                const genderMult = gender === "Male" ? 1.05 : 0.95
                
                // Apply all multipliers for variation
                const basePrevalence = (1 + seededRandom() * 49) * (1 + (year - 2021) * 0.05)
                const prevalence = Math.floor(basePrevalence * diseaseMult.prevalence * ageMult * genderMult)
                
                const baseIncidence = (2 + seededRandom() * 78) * (1 + (year - 2021) * 0.03)
                const incidence = Math.floor(baseIncidence * diseaseMult.incidence * ageMult)
                
                const baseVaxRate = 5 + seededRandom() * 90
                const vaccinationRate = baseVaxRate * regionMult.vaccinationRate
                
                const basePrice = 2 + seededRandom() * 148
                const price = basePrice * diseaseMult.price * brandMult
                
                const priceElasticity = 5 + seededRandom() * 45
                
                const baseVolume = 1 + seededRandom() * 199
                const volumeUnits = Math.floor(baseVolume * regionMult.volume * ageMult)
                
                const revenue = price * volumeUnits
                const marketValueUsd = revenue * (0.8 + seededRandom() * 0.4)
                
                const baseMarketShare = 1 + seededRandom() * 24
                const marketSharePct = baseMarketShare * regionMult.marketShare * brandMult
                
                const baseCAGR = -2 + seededRandom() * 17
                const cagr = baseCAGR * diseaseMult.cagr
                const yoyGrowth = -5 + seededRandom() * 25
                const qty = Math.floor((1 + seededRandom() * 99) * regionMult.volume)
                
                const roa = roaTypes[Math.floor(seededRandom() * roaTypes.length)]
                const fdf = fdfTypes[Math.floor(seededRandom() * fdfTypes.length)]
                const procurement = procurementTypes[Math.floor(seededRandom() * procurementTypes.length)]
                const company = companies[Math.floor(seededRandom() * companies.length)]
                
                data.push({
                  recordId,
                  year,
                  region,
                  country,
                  incomeType,
                  disease,
                  market: disease,
                  brand,
                  company,
                  ageGroup,
                  gender,
                  segment: ["Gender", "Brand", "Age", "ROA", "FDF"][Math.floor(seededRandom() * 5)],
                  segmentBy: ["male", "female", brand, ageGroup][Math.floor(seededRandom() * 4)],
                  roa,
                  fdf,
                  formulation: fdf,
                  procurement,
                  publicPrivate: ["UNICEF", "GAVI", "PAHO", "Government"].includes(procurement) ? "Public" : "Private",
                  prevalence,
                  incidence,
                  vaccinationRate: Math.round(vaccinationRate * 100) / 100,
                  coverageRate: Math.round(vaccinationRate * (0.8 + seededRandom() * 0.3) * 100) / 100,
                  price: Math.round(price * 100) / 100,
                  priceElasticity: Math.round(priceElasticity * 100) / 100,
                  priceClass: price > 50 ? "Premium" : (price > 20 ? "Standard" : "Budget"),
                  volumeUnits,
                  qty,
                  revenue: Math.round(revenue * 100) / 100,
                  marketValueUsd: Math.round(marketValueUsd * 100) / 100,
                  value: Math.round(marketValueUsd * 100) / 100,
                  marketSharePct: Math.round(marketSharePct * 100) / 100,
                  share: Math.round(marketSharePct * 100) / 100,
                  cagr: Math.round(cagr * 100) / 100,
                  yoyGrowth: Math.round(yoyGrowth * 100) / 100,
                  yoy: Math.round(yoyGrowth * 100) / 100,
                  efficacyPct: Math.round((60 + seededRandom() * 38) * 100) / 100,
                })
                
                recordId++
              }
            }
          }
        }
      }
    }
  }
  
  return data
}

let dataCache: VaccineData[] | null = null

export const getData = (): VaccineData[] => {
  if (!dataCache) {
    try {
      dataCache = generateComprehensiveData()
    } catch (error) {
      dataCache = []
    }
  }
  return dataCache
}

// Function to clear cache and regenerate data (for development/testing)
export const clearDataCache = () => {
  dataCache = null
}

export interface FilterOptions {
  year?: number[]
  disease?: string[]
  region?: string[]
  incomeType?: string[]
  country?: string[]
  brand?: string[]
  company?: string[]
  ageGroup?: string[]
  gender?: string[]
  roa?: string[]
  fdf?: string[]
  procurement?: string[]
  [key: string]: any
}

export const filterDataframe = (data: VaccineData[], filters: FilterOptions): VaccineData[] => {
  let filtered = [...data]
  
  for (const [field, values] of Object.entries(filters)) {
    if (values && Array.isArray(values) && values.length > 0) {
      filtered = filtered.filter(item => {
        const itemValue = item[field as keyof VaccineData]
        // Handle number to string conversion for year field
        if (field === 'year' && typeof itemValue === 'number') {
          return values.map(v => String(v)).includes(String(itemValue))
        }
        return values.includes(itemValue as any)
      })
    }
  }
  
  return filtered
}

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`
  } else if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`
  } else if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K`
  }
  return Math.round(num).toLocaleString('en-US')
}

export const formatWithCommas = (num: number, decimals = 1): string => {
  const value = parseFloat(num.toFixed(decimals))
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export const addCommas = (num: number | null | undefined): string | number | null | undefined => {
  if (num === null || num === undefined || isNaN(num)) {
    return num
  }
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export type { VaccineData }

