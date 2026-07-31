"use client";

import { useState, type ReactNode } from "react";
import { ArrowUp, Send, Plus, MessageSquare } from "lucide-react";
import { SiNotion, SiTencentqq } from "react-icons/si";
import { FaWeixin } from "react-icons/fa6";

type MenuItem = {
  key: string;
  label: string;
  icon: () => ReactNode;
  action: "top" | "link";
  href?: string;
};

const MENU_ITEMS: MenuItem[] = [
  { key: "top", label: "回到顶部", icon: () => <ArrowUp className="w-4 h-4" />, action: "top" },
  {
    key: "notion",
    label: "Notion 资源库",
    icon: () => <SiNotion className="w-4 h-4" />,
    action: "link",
    href: "https://199909.notion.site/faebd1c82aca47669b20fa1b8c37106b?source=copy_link",
  },
  {
    key: "wechat",
    label: "微信公众号",
    icon: () => <FaWeixin className="w-4 h-4" />,
    action: "link",
    href: "https://my.feishu.cn/wiki/RMKjwYflBiru4qkyktjcHl7mnLh?from=from_copylink",
  },
  {
    key: "feishu",
    label: "飞书资源库",
    icon: () => <Send className="w-4 h-4" />,
    action: "link",
    href: "https://my.feishu.cn/wiki/VYxcwTey8iHJVpkBoA9cOqG8nqh",
  },
  {
    key: "qq",
    label: "QQ群",
    icon: () => <SiTencentqq className="w-4 h-4" />,
    action: "link",
    href: "https://qm.qq.com/q/Dhu9fAUUDe",
  },
  {
    key: "info",
    label: "信息反馈",
    icon: () => <MessageSquare className="w-4 h-4" />,
    action: "link",
    href: "https://my.feishu.cn/share/base/form/shrcnjw0LDFhmDUS8vfQFXLnz0e",
  },
];

export function FloatingMenu() {
  const [open, setOpen] = useState(false);

  const handleItemClick = (item: MenuItem) => {
    if (item.action === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item.href && item.href !== "#") {
      window.open(item.href, "_blank", "noopener,noreferrer");
    }
    setOpen(false);
  };

  const btnBase =
    "flex items-center justify-center rounded-full text-primary-foreground bg-primary shadow-md transition-all duration-200 ease-out h-8 w-8 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0";

  return (
    <div className="fixed right-4 md:right-6 bottom-20 z-50 flex flex-col items-end">
      {/* 子按钮区：绝对定位在主按钮上方 */}
      <div className="absolute bottom-full right-0 flex flex-col items-end gap-1.5 mb-1">
        {MENU_ITEMS.map((item, idx) => (
          <button
            key={item.key}
            type="button"
            aria-label={item.label}
            onClick={() => handleItemClick(item)}
            className={[
              btnBase,
              open
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-2 scale-95 pointer-events-none",
            ].join(" ")}
            style={{ transitionDelay: open ? `${idx * 30}ms` : "0ms" }}
          >
            {item.icon()}
          </button>
        ))}
      </div>

      {/* 主按钮 */}
      <button
        type="button"
        aria-label={open ? "收起菜单" : "展开菜单"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[btnBase, "hover:scale-105", open ? "rotate-45" : "rotate-0"].join(" ")}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
