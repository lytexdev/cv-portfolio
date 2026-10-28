export type Locale = 'de' | 'en'

export type SectionId = 'whoami' | 'experience' | 'stack' | 'projects' | 'more' | 'contact'

export type TechId =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'php'
  | 'rust'
  | 'html'
  | 'css'
  | 'scss'
  | 'vue'
  | 'nuxt'
  | 'react'
  | 'nextjs'
  | 'tailwind'
  | 'vite'
  | 'symfony'
  | 'shopware'
  | 'graphql'
  | 'nodejs'
  | 'fastapi'
  | 'flask'
  | 'postgresql'
  | 'sqlite'
  | 'redis'
  | 'docker'
  | 'aws'
  | 'linux'
  | 'archlinux'
  | 'ubuntu'
  | 'ubuntu-server'
  | 'debian'
  | 'nginx'
  | 'npm-proxy'
  | 'letsencrypt'
  | 'cloudflare'
  | 'raspberrypi'
  | 'nextcloud'
  | 'paperless'
  | 'jellyfin'
  | 'frigate'
  | 'mqtt'
  | 'telegram'
  | 'discord'
  | 'gnupg'
  | 'ssh'
  | 'luks'
  | 'restic'
  | 'hardening'
  | 'git'
  | 'github'
  | 'kde'
  | 'fish'
  | 'bash'
  | 'cursor'
  | 'claudecode'
  | 'vscodium'
  | 'office'
  | 'image-editing'
  | 'bootstrap'
  | 'gitlab'
  | 'markdown'
  | 'figma'
  | 'angular'
  | 'svelte'
  | 'go'
  | 'java'
  | 'prisma'
  | 'wordpress'
  | 'mariadb'
  | 'mysql'
  | 'bitcoin'
  | 'monero'
  | 'kotlin'
  | 'windows'
  | 'macos'
  | 'android'
  | 'rabbitmq'
  | 'celery'
  | 's3'
  | 'minio'
  | 'obsidian'
  | 'mailcow'
  | 'amplify'
  | 'restapi'
  | 'openai-codex'
  | 'microsoft-copilot'
  | 'react-native'
  | 'expo'
  | 'vuetify'
  | 'esp32'
  | 'arduino'
  | 'openai'
  | 'apache'
  | 'caddy'
  | 'encryption'
  | 'cli'
  | 'linuxmint'
  | 'kali'
  | 'opensuse'
  | 'fedora'
  | 'minecraft'
  | 'junit'
  | 'phpunit'
  | 'vitest'
  | 'cypress'
  | 'pytest'
  | 'mongodb'
  | 'nixos'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'ruby'
  | 'spring'
  | 'springboot'
  | 'django'
  | 'laravel'
  | 'angularjs'
  | 'electron'
  | 'express'
  | 'solidjs'
  | 'pytorch'
  | 'tensorflow'
  | 'flutter'
  | 'ktor'
  | 'unity'
  | 'dotnet'
  | 'azure'
  | 'rails'
  | 'tauri'
  | 'actix'
  | 'axum'
  | 'unrealengine'
  | 'godot'

export type SpokenLanguageCode = 'de' | 'en' | 'ru' | 'es' | 'fr' | 'tr' | 'it' | 'pl'

export type LanguageLevel = 'native' | 'fluent' | 'advanced' | 'good' | 'basic'

export type SpokenLanguage = {
  code: SpokenLanguageCode
  level: LanguageLevel
}

export type StackGroupId = 'languages' | 'frontend' | 'backend' | 'infra' | 'security' | 'tools'

export type ExperienceId = 'freelance' | 'qiky' | 'apprenticeship'

export type ProjectSlug =
  | 'kb-reifendienst'
  | 'homelab'
  | 'camera-system'
  | 'rust-backup'
  | 'lytex-media'
  | 'lockbox'
  | 'secure-shredder'
  | 'metadata-cli'
  | 'security-blog'
  | 'muffin-bot'
  | 'med-tracker'
  | 'resilient-shop'

export type InterestId = 'webdev' | 'security' | 'linux' | 'biology' | 'crypto'
export type StrengthId = 'analytical' | 'helpful' | 'goalOriented'

export type CvDictionary = {
  meta: {
    title: string
    description: string
  }
  skipLink: string
  role: string
  summary: string
  availability: string
  sections: Record<
    SectionId,
    {
      rail: string
      title: string
    }
  >
  hero: {
    prompt: string
    ctaPrint: string
    tokenBadge: string
    tokenRole: string
    tokenDismiss: string
    metaLocation: string
    metaAge: string
    metaLanguages: string
    metaAvailability: string
    ageYears: string
  }
  experience: {
    entries: Record<
      ExperienceId,
      {
        role: string
        company: string
        location: string
        highlights: string[]
      }
    >
    since: string
    documents: {
      title: string
      view: string
      download: string
      pdf: string
      image: string
    }
  }
  stack: {
    groups: Record<StackGroupId, string>
    moreLabel: string
  }
  projects: {
    featured: Record<
      ProjectSlug,
      {
        kicker: string
        title: string
        summary: string
        highlights: string[]
        linkLabel: string
        images: Record<string, { alt: string; caption: string }>
      }
    >
    compact: Record<
      ProjectSlug,
      {
        kicker: string
        title: string
        oneLiner: string
        highlights: string[]
        images: Record<string, { alt: string; caption: string }>
      }
    >
    details: string
    viewProject: string
    websiteLink: string
    gallery: {
      open: string
      close: string
      previous: string
      next: string
    }
  }
  more: {
    languagesTitle: string
    languageNames: Record<SpokenLanguageCode, string>
    languageLevels: Record<LanguageLevel, string>
    interestsTitle: string
    interests: Record<InterestId, string>
    strengthsTitle: string
    strengths: Record<StrengthId, string>
    moreSkillsTitle: string
    dailyDriverTitle: string
    dailyDriverTagline: string
  }
  contact: {
    headline: string
    publicHint: string
    expiredHint: string
    saveVcard: string
    savePdf: string
    copyEmail: string
    emailCopied: string
    phone: string
    address: string
    birthDate: string
    ageTooltip: string
  }
  palette: {
    placeholder: string
    groups: {
      navigation: string
      actions: string
      links: string
    }
    actions: {
      theme: string
      lang: string
      copyEmail: string
      print: string
      vcard: string
      terminal: string
    }
  }
  theme: {
    toLight: string
    toDark: string
  }
  terminal: {
    open: string
    prompt: string
    readOnlyNote: string
  }
  notFound: {
    title: string
    message: string
    back: string
  }
  error: {
    title: string
    retry: string
  }
  footer: {
    tagline: string
    imprint: string
    privacy: string
    source: string
  }
  externalNewTab: string
  collapse: {
    show: string
    hide: string
  }
  duration: {
    years: string
    year: string
    months: string
    month: string
  }
}
