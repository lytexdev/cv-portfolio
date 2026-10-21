import type { MetadataRoute } from 'next'
import { getEnv } from '@/lib/server/env'

export default function robots(): MetadataRoute.Robots {
  if (!getEnv().indexPublic) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/sudo',
          '/sudo/',
          '/admin',
          '/wp-admin',
          '/api/',
          '/media/',
          '/e/',
        ],
      },
    ],
  }
}
