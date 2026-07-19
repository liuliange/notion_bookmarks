# 更新日志

本文档记录了项目的所有重大变更。

## [Unreleased]

### 删除
- 移除所有小组件（简易时钟、圆形时钟、天气、IP信息、热搜、自选股）
- 移除小组件相关 API 路由（hot-news、weather）
- 移除小组件相关依赖（lunar-javascript、qweather-icons、node-html-parser）
- 移除相关测试和类型定义

### 优化
- 保留置顶推广和标签广告功能，从 HomeWidgets 中独立
- 统一五主题框架：cyberpunk 样式归位到独立 style.css
- LinkCard 统一使用 group 类，消除主题特殊分支
- 同步 navdeal 的 extractColor 和 cardColor 支持

### 修复
- 修复 cyberpunk 颜色卡片霓虹边框缺失
- 修复赛博朋克主题侧边栏样式异常


## [1.0.0] - 2024-07-25

### 新增

#### 小组件
- 新增天气和农历显示功能
- 新增位置选择和搜索功能
- 新增热搜功能，整合多个平台数据

#### 界面与主题
- 新增多个新主题，丰富界面选择
- 新增 Cyberpunk 主题

#### 网站分析
- 新增 Google Analytics，用于网站分析
- 新增微软 Clarity 网站分析

### 优化
- 优化了移动端和 PC 端的 UI 布局
- 优化了热搜列表的样式和交互
- 优化了空气质量组件的样式和代码
- 重构了部分组件代码，提高了可维护性

### 修复
- 修复了 Notion API 的分页问题
- 修复了主题切换时的一些 bug
- 修复了 LinkCard 的显示 bug
- 修复了标签和卡片样式的若干问题

---

*此日志由 AI 根据 Git 提交记录自动生成。*