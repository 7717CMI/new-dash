import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Heart, DollarSign, TrendingUp, PieChart, ShoppingCart, Pill, FlaskConical, ArrowRight, ArrowLeft, LucideIcon } from 'lucide-react'
import { DemoNotice } from '../components/DemoNotice'

interface HomeProps {
  onNavigate: (page: string) => void
}

interface Module {
  title: string
  subtitle: string
  icon: LucideIcon
  id: string
  gradient: string
}

interface Category {
  title: string
  description: string
  icon: LucideIcon
  modules: Module[]
  gradient: string
  bgGradient: string
}

export function Home({ onNavigate }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const vaccineModules: Module[] = [
    {
      title: "Epidemiology",
      subtitle: "Disease prevalence and incidence analysis",
      icon: Activity,
      id: "Epidemiology",
      gradient: "#0075FF",
    },
    {
      title: "Vaccination Rate",
      subtitle: "Coverage and vaccination rate tracking",
      icon: Heart,
      id: "VaccinationRate",
      gradient: "#0075FF",
    },
  ]

  const marketAnalysisModules: Module[] = [
    {
      title: "Market Analysis",
      subtitle: "Market value and volume analysis by segments",
      icon: TrendingUp,
      id: "MarketAnalysis",
      gradient: "#0075FF",
    },
  ]

  const categories: Category[] = [
    {
      title: "By Vaccine",
      description: "Analyze vaccine-specific data, disease epidemiology, and vaccination rates",
      icon: FlaskConical,
      modules: vaccineModules,
      gradient: "#0075FF",
      bgGradient: "rgba(0, 117, 255, 0.05)",
    },
    {
      title: "By Market Analysis",
      description: "Explore market trends, pricing, growth rates, and competitive analysis",
      icon: TrendingUp,
      modules: marketAnalysisModules,
      gradient: "#0075FF",
      bgGradient: "rgba(0, 117, 255, 0.05)",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const handleCategoryClick = (categoryTitle: string) => {
    const category = categories.find(cat => cat.title === categoryTitle)
    // If category has only one module, navigate directly to it
    if (category && category.modules.length === 1) {
      onNavigate(category.modules[0].id)
    } else {
      setSelectedCategory(categoryTitle)
    }
  }

  const handleBackClick = () => {
    setSelectedCategory(null)
  }

  const selectedCategoryData = categories.find(cat => cat.title === selectedCategory)

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={itemVariants}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
          Global Vaccine Market Analytics Dashboard
        </h1>
        <p className="text-lg text-electric-blue dark:text-cyan-accent">
          Comprehensive market intelligence and forecasting analysis | 2021-2035
        </p>
      </motion.div>

      <DemoNotice />

      <AnimatePresence mode="wait">
        {!selectedCategoryData ? (
          // Category Selection View
          <motion.div
            key="categories"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2 text-center">
                Select Analysis Category
              </h2>
              <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mb-8">
                Choose your analysis approach to explore vaccine market data
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {categories.map((category) => {
                const CategoryIcon = category.icon
                
                return (
                  <motion.button
                    key={category.title}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategoryClick(category.title)}
                    className="w-full p-8 rounded-2xl border-2 border-gray-200 dark:border-navy-light bg-white dark:bg-navy-card hover:border-electric-blue hover:shadow-xl dark:hover:shadow-2xl transition-all text-left relative overflow-hidden group"
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4 transform group-hover:scale-110 transition-transform bg-electric-blue"
                        >
                          <CategoryIcon size={32} />
                        </div>
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <ArrowRight
                            size={24}
                            className="text-text-secondary-light dark:text-text-secondary-dark group-hover:text-electric-blue transition-colors"
                          />
                        </motion.div>
                      </div>
                      <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                        {category.title}
                      </h3>
                      <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-electric-blue font-medium">
                        <span>{category.modules.length} Analysis Module{category.modules.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ) : (
          // Module Selection View
          <motion.div
            key={selectedCategory}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-2 mb-6 text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue transition-colors group"
            >
              <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Categories</span>
            </motion.button>

            {/* Category Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white bg-electric-blue"
                >
                  {(() => {
                    const CategoryIcon = selectedCategoryData.icon
                    return <CategoryIcon size={32} />
                  })()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                    {selectedCategoryData.title}
                  </h2>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    {selectedCategoryData.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Module Grid */}
            <div className={`grid grid-cols-1 ${
              selectedCategoryData.modules.length === 2 
                ? 'md:grid-cols-2' 
                : selectedCategoryData.modules.length === 3
                ? 'md:grid-cols-3'
                : 'md:grid-cols-2 lg:grid-cols-3'
            } gap-6`}>
              {selectedCategoryData.modules.map((module, moduleIndex) => {
                const ModuleIcon = module.icon
                return (
                  <motion.button
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + moduleIndex * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate(module.id)}
                    className="bg-white dark:bg-navy-card rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-xl dark:hover:shadow-2xl border border-gray-200 dark:border-navy-light hover:border-electric-blue h-full min-h-[240px] group"
                  >
                    <div
                      className="w-16 h-16 mb-4 rounded-xl flex items-center justify-center text-white transform group-hover:scale-110 transition-transform bg-electric-blue"
                    >
                      <ModuleIcon size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                      {module.title}
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {module.subtitle}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-electric-blue opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">View Analysis</span>
                      <ArrowRight size={16} />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

