import { relations } from 'drizzle-orm'
import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core'

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

export type User = typeof users.$inferSelect
export type UserRole = typeof userRoles.$inferSelect
export type Setting = typeof settings.$inferSelect
export type AuditLog = typeof auditLogs.$inferSelect

export const userRoleSelect = {
  id: userRoles.id,
  names: userRoles.names,
  permissions: userRoles.permissions,
  priority: userRoles.priority,
  active: userRoles.active,
  createdAt: userRoles.createdAt,
  updatedAt: userRoles.updatedAt,
}
