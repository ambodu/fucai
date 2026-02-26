import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "彩数通 - 福彩3D数据查询与AI智能分析平台",
  description: "基于AI的福彩3D历史数据查询与统计分析平台，提供号码走势、遗漏统计、频率分布等专业数据工具。",
};

/**
 * Root Layout
 * 
 * Material Design 3 规范推荐 Roboto 字体族。
 * 此处通过 CSS variable 注入，保留 PingFang SC 作为中文回退。
 * body 使用 md-surface 色作为全局背景。
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* MD3 推荐字体: Roboto（含 400/500/700 字重） */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
