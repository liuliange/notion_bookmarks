'use client'

import React, { memo, useState, useEffect } from 'react'
import { WebsiteConfig } from '@/types'
import { FaGithub, FaXTwitter } from 'react-icons/fa6'
import { cn } from '@/lib/utils'

interface FooterProps {
  config: WebsiteConfig
  className?: string
}

const Footer = memo(function Footer({ config, className = "" }: FooterProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  // 🆕 判断是否为移动端
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 🆕 检查屏幕宽度
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    // 🆕 如果不是移动端，不启用滚动显隐逻辑
    if (!isMobile) return

    const checkHeight = () => {
      const isShortPage = document.documentElement.scrollHeight <= window.innerHeight
      if (isShortPage) {
        setIsVisible(true)
      }
    }
    checkHeight()

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const scrollDelta = currentScrollY - lastScrollY
          const threshold = 10

          if (currentScrollY < 50) {
            setIsVisible(true)
          } else if (scrollDelta > threshold) {
            setIsVisible(false)
          } else if (scrollDelta < -threshold) {
            setIsVisible(true)
          }

          setLastScrollY(currentScrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', checkHeight)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkHeight)
    }
  }, [lastScrollY, isMobile])

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t py-2 md:py-4 z-10 transition-transform duration-300 ease-in-out",
        // 🆕 移动端：滑动控制显隐；桌面端：始终显示
        isMobile ? (isVisible ? "translate-y-0" : "translate-y-full") : "translate-y-0",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-1 md:gap-4 md:flex-row md:justify-between">
          <div className="flex items-center space-x-4">
            {config.SOCIAL_GITHUB && (
              <a
                href={config.SOCIAL_GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
            )}
            {config.SOCIAL_BLOG && (
              <a
                href={config.SOCIAL_BLOG}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Blog"
              >
                <img
                  src="/logo_blog.svg"
                  alt="Blog"
                  width={20}
                  height={20}
                  className="filter-muted hover:filter-none transition-all"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
            {config.SOCIAL_X && (
              <a
                href={config.SOCIAL_X}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="X (Twitter)"
              >
                <FaXTwitter className="w-5 h-5" />
              </a>
            )}
            {config.SOCIAL_QQ && (
              <a
                href={config.SOCIAL_QQ}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="QQ"
              >
                <img
                  src="/logo_qq.svg"
                  alt="QQ"
                  width={20}
                  height={20}
                  className="filter-muted hover:filter-none transition-all"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
            {config.SOCIAL_BUY && (
              <a
                href={config.SOCIAL_BUY}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="购买"
              >
                <img
                  src="/logo_buy.svg"
                  alt="购买"
                  width={20}
                  height={20}
                  className="filter-muted hover:filter-none transition-all"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
            {config.SOCIAL_SHOPEE && (
              <a
                href={config.SOCIAL_SHOPEE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="商城"
              >
                <img
                  src="/logo_shopee.svg"
                  alt="商城"
                  width={20}
                  height={20}
                  className="filter-muted hover:filter-none transition-all"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
            {config.SOCIAL_JIKE && (
              <a
                href={config.SOCIAL_JIKE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="即刻"
              >
                <img
                  src="/logo_jike.svg"
                  alt="即刻"
                  width={20}
                  height={20}
                  className={cn(
                    "filter-muted hover:filter-none transition-all"
                  )}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
                       {config.SOCIAL_WEIBO && (
              <a
                href={config.SOCIAL_WEIBO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="微博"
              >
                <img
                  src="/logo_weibo.svg"
                  alt="微博"
                  width={20}
                  height={20}
                  className="filter-muted hover:filter-none transition-all"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
            {config.SOCIAL_XIAOHONGSHU && (
              <a
                href={config.SOCIAL_XIAOHONGSHU}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="小红书"
              >
                <img
                  src="/xhs_logo.svg"
                  alt="小红书"
                  width={20}
                  height={20}
                  className={cn(
                    "filter-muted hover:filter-none transition-all"
                  )}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
            {config.SOCIAL_GZH && (
              <a
                href={config.SOCIAL_GZH}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="公众号"
              >
                <img
                  src="/logo_gzh.svg"
                  alt="公众号"
                  width={20}
                  height={20}
                  className="filter-muted hover:filter-none transition-all"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
                        {config.SOCIAL_WECHAT && (
              <a
                href={config.SOCIAL_WECHAT}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="微信"
              >
                <img
                  src="/logo_wechat.svg"
                  alt="微信"
                  width={20}
                  height={20}
                  className="filter-muted hover:filter-none transition-all"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
                        {config.SOCIAL_DOUYIN && (
              <a
                href={config.SOCIAL_DOUYIN}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="抖音"
              >
                <img
                  src="/logo_douyin.svg"
                  alt="抖音"
                  width={20}
                  height={20}
                  className="filter-muted hover:filter-none transition-all"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <p className="hidden md:block text-sm text-muted-foreground">
            </p>
            <p className="text-sm text-muted-foreground">
              {config.SITE_AUTHOR} · 你的省钱生活指南
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
})

export default Footer