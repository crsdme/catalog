import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { DEFAULT_SETTINGS } from '@/config/constants'
import { env } from '@/config/env'
import { connectDB, db } from '@/config/db'
import { userRoles, users } from '@/db/schema'
import * as CatalogsRepo from '@/repositories/catalogs.repo'
import * as SettingsRepo from '@/repositories/settings.repo'
import * as TelegramUsersRepo from '@/repositories/telegram-users.repo'
import * as UserRolesRepo from '@/repositories/user-roles.repo'

async function initializeApp() {
  console.log('Initializing database...')

  await connectDB()
  await SettingsRepo.seedDefaults(DEFAULT_SETTINGS)

  const existingUsers = await db.select({ id: users.id }).from(users).limit(1)

  if (existingUsers.length === 0) {
    const role = await UserRolesRepo.createAdminRole()

    const hashedPassword = await bcrypt.hash('admin', 10)

    await db.insert(users).values({
      name: 'Admin',
      login: 'admin',
      password: hashedPassword,
      roleId: role.id,
      active: true,
    })

    console.log('Admin user created (login: admin, password: admin)')
  }

  if (env.googleDriveFolderId) {
    await CatalogsRepo.seedCatalog({
      slug: env.defaultCatalogSlug ?? 'lux-001',
      title: 'Hair Catalog',
      driveFolderId: env.googleDriveFolderId,
    })
    console.log(`Seed catalog ${env.defaultCatalogSlug ?? 'lux-001'} ensured`)
  }

  if (env.telegramAllowedUserIds.length) {
    await TelegramUsersRepo.seedFromEnv(env.telegramAllowedUserIds)
    console.log(`Seeded ${env.telegramAllowedUserIds.length} Telegram user(s) from env`)
  }

  console.log('Database initialized')
}

initializeApp()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error initializing database:', err)
    process.exit(1)
  })
