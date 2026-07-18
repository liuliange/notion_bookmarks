'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from '@/types';
import { cn } from '@/lib/utils';
import TagAdPill from './TagAdPill';

interface TagAdBarProps {
    links: Link[];
    theme?: string;
}

const DRAG_THRESHOLD = 5;

export default function TagAdBar({ links, theme }: TagAdBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const mouseDown = useRef(false);
    const startX = useRef(0);
    const scrollStart = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    // 全局 mouseup 清理：防止拖拽到容器外释放鼠标导致状态残留
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            mouseDown.current = false;
            setIsDragging(false);
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        mouseDown.current = true;
        startX.current = e.pageX;
        scrollStart.current = scrollRef.current?.scrollLeft ?? 0;
        setIsDragging(false);
    }, []);

    const onMouseUp = useCallback(() => {
        mouseDown.current = false;
        setIsDragging(false);
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!mouseDown.current) return;
        e.preventDefault();
        const dx = e.pageX - startX.current;
        // 位移超过阈值视为拖拽，阻止标签点击跳转
        if (Math.abs(dx) > DRAG_THRESHOLD) {
            setIsDragging(true);
        }
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollStart.current - dx;
        }
    }, []);

    const onMouseLeave = useCallback(() => {
        mouseDown.current = false;
        setIsDragging(false);
    }, []);

    if (links.length === 0) return null;

    return (
        <div
            ref={scrollRef}
            className={cn(
                "w-full overflow-x-auto scrollbar-none select-none [-webkit-user-drag:none]",
                isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        >
            <div className={cn(
                "flex items-center gap-3",
                isDragging && "pointer-events-none"
            )}>
                {links.map((link) => (
                    <TagAdPill key={link.id} link={link} theme={theme} />
                ))}
            </div>
        </div>
    );
}
