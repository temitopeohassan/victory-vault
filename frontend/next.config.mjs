/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Suppress _document error in App Router (not needed)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { isServer, webpack }) => {
    // Ignore optional dependencies that aren't needed in browser
    if (!isServer) {
      // Set fallback to false for optional dependencies
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
      }

      // Use IgnorePlugin to suppress module resolution warnings
      // webpack is provided by Next.js in the config function
      config.plugins.push(
        new webpack.IgnorePlugin({
          checkResource(resource, context) {
            // Ignore @react-native-async-storage/async-storage when imported from @metamask/sdk
            if (
              resource === '@react-native-async-storage/async-storage' &&
              context.includes('@metamask/sdk')
            ) {
              return true
            }
            // Ignore pino-pretty when imported from pino
            if (resource === 'pino-pretty' && context.includes('pino')) {
              return true
            }
            return false
          },
        })
      )
    }
    return config
  },
}

export default nextConfig
