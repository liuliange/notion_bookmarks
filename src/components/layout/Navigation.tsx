'use client'

import React, { useState, useEffect, memo, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { Search } from '@/components/Search'
import * as Icons from 'lucide-react'
import { WebsiteConfig } from '@/types'
import { useTheme } from 'next-themes'

interface Category {
  id: string
  name: string
  iconName?: string
  subCategories: {
    id: string
    name: string
  }[]
}

interface NavigationProps {
  categories: Category[]
  config: WebsiteConfig
}

const defaultConfig: WebsiteConfig = {
  SOCIAL_GITHUB: '',
  SOCIAL_BLOG: '',
  SOCIAL_X: '',
  SOCIAL_JIKE: '',
  SOCIAL_WEIBO: '',
  SOCIAL_WECHAT: '',
  SOCIAL_DOUYIN: ''
}

const Navigation = memo(function Navigation({ categories, config = defaultConfig }: NavigationProps) {
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const { theme } = useTheme()
  
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }, [])

  const handleNavClick = useCallback((categoryId: string, subCategoryId?: string) => {
    setActiveCategory(categoryId)
    
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    const elementId = subCategoryId ? `${categoryId}-${subCategoryId}` : categoryId
    const element = document.getElementById(elementId)
    
    if (element) {
      const rect = element.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      
      window.scrollTo({
        top: rect.top + scrollTop - 100,
        behavior: 'smooth'
      })
    }
  }, [])

  useEffect(() => {
    if (categories.length > 0 && activeCategory === '') {
      setActiveCategory(categories[0].id)
    }
  }, [categories, activeCategory])

  // 滚动联动：监听滚动，自动高亮并滚动分类菜单
  useEffect(() => {
    if (typeof window === 'undefined' || categories.length === 0) return

    let ticking = false
    let currentIndex = 0

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = document.querySelectorAll('.category-section')
          if (sections.length === 0) {
            ticking = false
            return
          }

          const scrollPos = window.scrollY + window.innerHeight / 3
          let newIndex = 0

          sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect()
            const sectionTop = rect.top + window.scrollY
            if (sectionTop < scrollPos) {
              newIndex = index
            }
          })

          if (newIndex !== currentIndex && categories[newIndex]) {
            currentIndex = newIndex
            setActiveCategory(categories[newIndex].id)

            if (mobileMenuRef.current) {
              const menuItems = mobileMenuRef.current.querySelectorAll('.category-menu-item')
              if (menuItems[newIndex]) {
                const menuItem = menuItems[newIndex] as HTMLElement
                const menuRect = mobileMenuRef.current.getBoundingClientRect()
                const scrollLeft = menuItem.offsetLeft - menuRect.width / 2 + menuItem.offsetWidth / 2
                mobileMenuRef.current.scrollTo({
                  left: Math.max(0, scrollLeft),
                  behavior: 'smooth'
                })
              }
            }
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [categories])

  // 如果未挂载，返回空占位，避免 hydration 错误
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* 移动端顶部导航 */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-background border-b">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Icons.ShoppingBag className="w-5 h-5 text-foreground" />
            <span className="neon-title text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">{config.SITE_TITLE}</span>
          </div>
          <div className="flex-1 mx-2 min-w-0">
            <Search />
          </div>
          <div className="flex-shrink-0">
            {config.SHOW_THEME_SWITCHER !== 'false' && <ThemeSwitcher />}
          </div>
        </div>
        <div 
          ref={mobileMenuRef}
          className="overflow-x-auto flex items-center h-12 border-t scrollbar-none"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex px-4 min-w-full">
            <div className="flex space-x-2 mx-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleNavClick(category.id)}
                  className={cn(
                    "category-menu-item whitespace-nowrap px-3 py-1.5 text-sm rounded-full transition-colors shrink-0",
                    activeCategory === category.id
                      ? theme === 'simple-dark' 
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-primary text-white font-medium"
                      : theme === 'simple-dark'
                        ? "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 桌面端边导航 */}
      <nav className="hidden lg:block w-[280px] flex-shrink-0 h-screen sticky top-0 p-4 overflow-y-auto border-r">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Icons.ShoppingBag className="w-5 h-5 text-foreground" />
            <span className="neon-title">{config.SITE_TITLE}</span>
          </div>
          {config.SHOW_THEME_SWITCHER !== 'false' && <ThemeSwitcher />}
        </div>

        <div className="mb-4 px-1">
          <Search />
        </div>

        <ul className="space-y-1 pb-24">
          {categories.map((category) => {
            const IconComponent = category.iconName && (category.iconName in Icons)
              ? (Icons[category.iconName as keyof typeof Icons] as React.ComponentType)
              : Icons.Globe

            return (
              <li key={category.id}>
                <div className="flex flex-col">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors",
                      expandedCategories.has(category.id)
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                    <Icons.ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        expandedCategories.has(category.id) ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {expandedCategories.has(category.id) && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {category.subCategories.map((subCategory) => (
                        <li key={subCategory.id}>
                          <button
                            onClick={() => handleNavClick(category.id, subCategory.id)}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-lg transition-colors text-sm",
                              activeCategory === `${category.id}-${subCategory.id}`
                                ? "bg-primary text-white font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            {subCategory.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
})

export default Navigation