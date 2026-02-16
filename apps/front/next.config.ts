import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://192.168.2.120:3000',
    ],
  } as any,
}

export default nextConfig
