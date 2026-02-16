import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "彩数通 - 福彩3D数据查询与AI智能分析平台",
  description: "基于AI的福彩3D历史数据查询与统计分析平台，提供号码走势、遗漏统计、频率分布等专业数据工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
