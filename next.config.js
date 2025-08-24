const API_HOST = process.env.API_HOST || 'http://127.0.0.1:8001';

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: 'build',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_HOST}/api/:path*`,
      },
    ];
  },
};