// Cloudflare dev 初始化：仅在开发模式 + 安装了 @opennextjs/cloudflare 时加载
if (process.env.NODE_ENV === "development") {
  try {
    const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  } catch {
    // Not running in Cloudflare mode, skip
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14: experimental.serverComponentsExternalPackages
  // Next.js 15+: serverExternalPackages
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', '@google/genai'],
  },
};

export default nextConfig;
