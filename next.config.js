module.exports = {
  env: {
    BASE_URL:
      process.env.NODE_ENV === 'production'
        ? // ? process.env.NEXT_PUBLIC_VERCEL_URL
          'https://311app.vercel.app'
        : 'http://localhost:3000',
  },
  future: {
    webpack5: true,
  },
}
