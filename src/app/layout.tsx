import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

/**
 * MD3 推荐字体: Roboto（含 400/500/700 字重）
 * 使用 next/font/google 自动优化加载，避免 layout shift。
 * CSS variable --font-roboto 可在全局样式中引用。
 */
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

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
    <html lang="zh-CN" className={roboto.variable}>
      <body className={`${roboto.className} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
