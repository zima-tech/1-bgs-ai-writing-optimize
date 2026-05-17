/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
    outputFileTracingIncludes: {
      '/**': ['./prisma/dev.db']
    }
  }
};

export default nextConfig;
