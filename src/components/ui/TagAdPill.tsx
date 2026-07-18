'use client';

import { Link } from '@/types';
import { cn } from '@/lib/utils';

interface TagAdPillProps {
    link: Link;
    className?: string;
    theme?: string;
}

export default function TagAdPill({ link, className, theme }: TagAdPillProps) {
    // 根据主题获取颜色
    const getThemeColors = () => {
        if (theme?.includes('cyberpunk')) {
            return { bg: 'bg-[hsl(286,100%,65%)]', text: 'text-white' };
        }
        if (theme?.includes('bauhaus')) {
            return { bg: 'bg-[var(--bauhaus-red)]', text: 'text-white' };
        }
        if (theme?.includes('macintosh')) {
            return { bg: 'bg-[var(--mac-ink)]', text: 'text-[var(--mac-paper)]' };
        }
        // simple-light / simple-dark 及其他默认主题
        return { bg: 'bg-primary', text: 'text-primary-foreground' };
    };

    const colors = getThemeColors();

    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 shrink-0 cursor-pointer",
                colors.bg,
                colors.text,
                className
            )}
        >
            {link.iconfile && (
                <img
                    src={link.iconfile}
                    alt=""
                    draggable={false}
                    className="w-4 h-4 rounded object-contain"
                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                />
            )}
            <span className={cn("text-sm font-medium truncate max-w-[90px]", colors.text)}>
                {link.name}
            </span>
        </a>
    );
}
