import { relations } from 'drizzle-orm'
import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export type MarkerPoint = { x: number, y: number }

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  names: jsonb('names').$type<Record<string, string>>().notNull(),
  permissions: jsonb('permissions').$type<string[]>().notNull().default([]),
  priority: integer('priority').notNull().default(0),
  active: boolean('active').notNull().default(true),
  removed: boolean('removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  seq: serial('seq').notNull(),
  login: text('login').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  roleId: uuid('role_id').notNull().references(() => userRoles.id),
  active: boolean('active').notNull().default(true),
  removed: boolean('removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull().default(''),
  scope: text('scope'),
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
  removed: boolean('removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  resource: jsonb('resource').$type<unknown>(),
  action: text('action').notNull(),
  changes: jsonb('changes').$type<Array<{ path: string, before: unknown, after: unknown }>>().notNull().default([]),
  comment: text('comment').notNull().default(''),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id],
  }),
  auditLogs: many(auditLogs),
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  createdBy: one(users, {
    fields: [auditLogs.createdById],
    references: [users.id],
  }),
}))

export const catalogs = pgTable('catalogs', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull().default(''),
  driveFolderId: text('drive_folder_id').notNull(),
  active: boolean('active').notNull().default(true),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  removed: boolean('removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const catalogLinks = pgTable('catalog_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(),
  catalogId: uuid('catalog_id').notNull().references(() => catalogs.id),
  clientName: text('client_name').notNull(),
  label: text('label').notNull().default(''),
  categoryIds: jsonb('category_ids').$type<string[]>().notNull().default([]),
  snapshotPhotoIds: jsonb('snapshot_photo_ids').$type<string[]>().notNull().default([]),
  managerTelegramId: text('manager_telegram_id'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  removed: boolean('removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const catalogCategories = pgTable('catalog_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  catalogId: uuid('catalog_id').notNull().references(() => catalogs.id),
  parentId: uuid('parent_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  path: text('path').notNull(),
  driveFolderId: text('drive_folder_id').notNull(),
  depth: integer('depth').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  removed: boolean('removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('catalog_categories_catalog_drive_folder_idx').on(table.catalogId, table.driveFolderId),
  uniqueIndex('catalog_categories_catalog_path_idx').on(table.catalogId, table.path),
])

export const catalogPhotos = pgTable('catalog_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  catalogId: uuid('catalog_id').notNull().references(() => catalogs.id),
  categoryId: uuid('category_id').references(() => catalogCategories.id),
  driveFileId: text('drive_file_id').notNull(),
  name: text('name').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  removed: boolean('removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('catalog_photos_catalog_drive_file_idx').on(table.catalogId, table.driveFileId),
])

export const photoSelections = pgTable('photo_selections', {
  id: uuid('id').primaryKey().defaultRandom(),
  catalogId: uuid('catalog_id').notNull().references(() => catalogs.id),
  photoId: uuid('photo_id').notNull().references(() => catalogPhotos.id),
  clientName: text('client_name').notNull(),
  linkToken: text('link_token'),
  markers: jsonb('markers').$type<MarkerPoint[]>().notNull().default([]),
  removed: boolean('removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('photo_selections_catalog_photo_client_idx').on(table.catalogId, table.photoId, table.clientName),
])

export const catalogsRelations = relations(catalogs, ({ many }) => ({
  links: many(catalogLinks),
  categories: many(catalogCategories),
  photos: many(catalogPhotos),
  selections: many(photoSelections),
}))

export const catalogCategoriesRelations = relations(catalogCategories, ({ one, many }) => ({
  catalog: one(catalogs, {
    fields: [catalogCategories.catalogId],
    references: [catalogs.id],
  }),
  parent: one(catalogCategories, {
    fields: [catalogCategories.parentId],
    references: [catalogCategories.id],
    relationName: 'categoryTree',
  }),
  photos: many(catalogPhotos),
}))

export const catalogLinksRelations = relations(catalogLinks, ({ one }) => ({
  catalog: one(catalogs, {
    fields: [catalogLinks.catalogId],
    references: [catalogs.id],
  }),
}))

export const catalogPhotosRelations = relations(catalogPhotos, ({ one, many }) => ({
  catalog: one(catalogs, {
    fields: [catalogPhotos.catalogId],
    references: [catalogs.id],
  }),
  category: one(catalogCategories, {
    fields: [catalogPhotos.categoryId],
    references: [catalogCategories.id],
  }),
  selections: many(photoSelections),
}))

export const photoSelectionsRelations = relations(photoSelections, ({ one }) => ({
  catalog: one(catalogs, {
    fields: [photoSelections.catalogId],
    references: [catalogs.id],
  }),
  photo: one(catalogPhotos, {
    fields: [photoSelections.photoId],
    references: [catalogPhotos.id],
  }),
}))

export const telegramAllowedUsers = pgTable('telegram_allowed_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  telegramId: text('telegram_id').notNull(),
  label: text('label').notNull().default(''),
  active: boolean('active').notNull().default(true),
  removed: boolean('removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('telegram_allowed_users_telegram_id_idx').on(table.telegramId),
])

export type User = typeof users.$inferSelect
export type UserRole = typeof userRoles.$inferSelect
export type Setting = typeof settings.$inferSelect
export type AuditLog = typeof auditLogs.$inferSelect
export type Catalog = typeof catalogs.$inferSelect
export type CatalogLink = typeof catalogLinks.$inferSelect
export type CatalogCategory = typeof catalogCategories.$inferSelect
export type CatalogPhoto = typeof catalogPhotos.$inferSelect
export type PhotoSelection = typeof photoSelections.$inferSelect
export type TelegramAllowedUser = typeof telegramAllowedUsers.$inferSelect

export const userRoleSelect = {
  id: userRoles.id,
  names: userRoles.names,
  permissions: userRoles.permissions,
  priority: userRoles.priority,
  active: userRoles.active,
  createdAt: userRoles.createdAt,
  updatedAt: userRoles.updatedAt,
}
