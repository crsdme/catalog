import { Telegraf } from 'telegraf'
import { env } from '@/config/env'
import { categoryPickerKeyboard, createdLinkKeyboard, linkActionsKeyboard, mainMenuKeyboard } from '@/bot/keyboards'
import { getSession, resetSession, toggleCategory, type BotSession } from '@/bot/session'
import * as CatalogService from '@/services/catalog.service'
import logger from '@/utils/logger'

import type { TelegramAllowedUserDTO } from '@catalog/shared'
import { isTelegramUserAllowed } from '@/services/telegram-allowlist.service'

function formatCategoryList(paths: string[]) {
  if (!paths.length)
    return '— все категории'
  return paths.map(path => `• ${path}`).join('\n')
}

function formatSyncResult(
  categoriesCount: number,
  syncResult: Awaited<ReturnType<typeof CatalogService.forceSyncCatalog>>['syncResult'],
) {
  if (!syncResult) {
    return `Категорий в базе: ${categoriesCount}\n(синхронизация пропущена — данные свежие)`
  }

  if (syncResult.categories === 0 && syncResult.photos === 0) {
    return (
      '⚠️ Папка Drive пуста или нет доступа.\n\n'
      + `Folder ID: ${env.googleDriveFolderId}\n\n`
      + 'Проверьте:\n'
      + '1. GOOGLE_DRIVE_FOLDER_ID — ID корневой папки с raw/colored\n'
      + '2. Папка расшарена на email service account\n'
      + '3. Внутри есть подпапки (raw, colored) или фото'
    )
  }

  return (
    `✅ Синхронизация завершена\n\n`
    + `Категорий: ${syncResult.categories}\n`
    + `Фото: ${syncResult.photos}\n`
    + `Подпапок на Drive: ${syncResult.folders}`
  )
}

async function loadCategories(catalogId: string, forceSync = false) {
  if (forceSync)
    return CatalogService.forceSyncCatalog(catalogId)
  return CatalogService.listCategoriesForCatalog(catalogId, false)
}

async function preloadCategories(session: BotSession) {
  if (session.categories?.length && session.catalogId)
    return session.categories

  const catalog = await CatalogService.getDefaultCatalog()
  session.catalogId = catalog.id
  session.categories = await CatalogService.getCategoriesFromDb(catalog.id)
  return session.categories
}

async function ensureCategories(session: BotSession) {
  if (session.categories?.length && session.catalogId)
    return session.categories

  return preloadCategories(session)
}

export function startTelegramBot() {
  if (!env.telegramBotToken) {
    logger.info('[Bot] TELEGRAM_BOT_TOKEN not set — bot disabled')
    return
  }

  const bot = new Telegraf(env.telegramBotToken)

  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id
    if (!userId || !(await isTelegramUserAllowed(userId))) {
      await ctx.reply('Нет доступа.')
      return
    }
    await next()
  })

  bot.catch((error, ctx) => {
    logger.error('[Bot] Error', error)
    void ctx.reply('Ошибка. Попробуйте ещё раз или перезапустите backend.')
  })

  bot.start(async (ctx) => {
    resetSession(String(ctx.from!.id))
    await ctx.reply(
      'Hairpick Catalog Bot\n\nСоздавайте ссылки с нужными категориями и смотрите выборы клиентов.',
      mainMenuKeyboard(),
    )
  })

  bot.hears('➕ Создать ссылку', async (ctx) => {
    const session = getSession(String(ctx.from!.id))
    session.step = 'awaiting_client_name'
    session.clientName = ''
    session.label = ''
    session.selectedCategoryIds = []
    session.categoryPage = 0
    void preloadCategories(session)
    await ctx.reply('Для кого ссылка? (имя клиента или пометка)\nПример: Anna / Свадьба 12.04')
  })

  bot.hears('📂 Мои ссылки', async (ctx) => {
    const links = await CatalogService.listManagerLinks(String(ctx.from!.id))
    if (!links.length) {
      await ctx.reply('Активных ссылок пока нет.')
      return
    }

    for (const link of links) {
      const title = link.label || link.clientName
      const url = `${env.frontendUrl}/c/${link.token}`
      await ctx.reply(
        `👤 ${title}\nКлиент: ${link.clientName}\n${url}`,
        linkActionsKeyboard(link.id, url),
      )
    }
  })

  bot.hears('🔄 Синхронизировать Drive', async (ctx) => {
    await ctx.reply('Синхронизация...')
    const catalog = await CatalogService.getDefaultCatalog()
    const { categories, syncResult } = await loadCategories(catalog.id, true)
    const session = getSession(String(ctx.from!.id))
    session.catalogId = catalog.id
    session.categories = categories
    await ctx.reply(formatSyncResult(categories.length, syncResult))
  })

  bot.on('text', async (ctx) => {
    const session = getSession(String(ctx.from!.id))
    const text = ctx.message.text.trim()

    if (['➕ Создать ссылку', '📂 Мои ссылки', '🔄 Синхронизировать Drive'].includes(text))
      return

    if (session.step === 'awaiting_client_name') {
      session.clientName = text
      session.label = text
      session.step = 'selecting_categories'
      session.categoryPage = 0

      const categories = await ensureCategories(session)
      if (!categories.length) {
        await ctx.reply(
          'Категории не найдены. Нажмите «🔄 Синхронизировать Drive» и попробуйте снова.',
        )
        session.step = 'idle'
        return
      }

      await ctx.reply(
        `Клиент: ${text}\n\nВыберите категории (можно несколько):`,
        categoryPickerKeyboard(categories, session.selectedCategoryIds, session.categoryPage),
      )
    }
  })

  bot.action(/^page:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery()
    const session = getSession(String(ctx.from!.id))
    session.categoryPage = Number(ctx.match[1])
    const categories = await ensureCategories(session)
    await ctx.editMessageReplyMarkup(
      categoryPickerKeyboard(categories, session.selectedCategoryIds, session.categoryPage).reply_markup,
    )
  })

  bot.action(/^cat:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery()
    const session = getSession(String(ctx.from!.id))
    toggleCategory(session, ctx.match[1])
    const categories = await ensureCategories(session)
    await ctx.editMessageReplyMarkup(
      categoryPickerKeyboard(categories, session.selectedCategoryIds, session.categoryPage).reply_markup,
    )
  })

  bot.action('cats:cancel', async (ctx) => {
    await ctx.answerCbQuery()
    resetSession(String(ctx.from!.id))
    await ctx.editMessageText('Отменено.')
  })

  bot.action('cats:done', async (ctx) => {
    await ctx.answerCbQuery()
    const session = getSession(String(ctx.from!.id))

    if (!session.selectedCategoryIds.length) {
      await ctx.reply('Выберите хотя бы одну категорию.')
      return
    }

    const catalogId = session.catalogId ?? (await CatalogService.getDefaultCatalog()).id
    const categories = await ensureCategories(session)
    const selectedPaths = categories
      .filter(category => session.selectedCategoryIds.includes(category.id))
      .map(category => category.path)

    if (session.editingLinkId) {
      await CatalogService.updateCatalogLink({
        id: session.editingLinkId,
        categoryIds: session.selectedCategoryIds,
      })
      await ctx.editMessageText(`Категории обновлены:\n${formatCategoryList(selectedPaths)}`)
      session.editingLinkId = undefined
      session.step = 'idle'
      return
    }

    const link = await CatalogService.createCatalogLink({
      catalogId,
      clientName: session.clientName,
      label: session.label,
      categoryIds: session.selectedCategoryIds,
      managerTelegramId: String(ctx.from!.id),
    })

    await ctx.editMessageText(
      `Ссылка создана\n\n`
      + `👤 ${session.label}\n`
      + `Категории:\n${formatCategoryList(selectedPaths)}\n\n`
      + `${link.data.url}`,
      createdLinkKeyboard(link.data.url),
    )
    resetSession(String(ctx.from!.id))
  })

  bot.action(/^linksel:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery()
    const linkId = ctx.match[1]
    const links = await CatalogService.listManagerLinks(String(ctx.from!.id))
    const link = links.find(item => item.id === linkId)
    if (!link) {
      await ctx.reply('Ссылка не найдена.')
      return
    }

    const { selections } = await CatalogService.getLinkSelections(link.token)
    if (!selections.length) {
      await ctx.reply(`👤 ${link.label || link.clientName}\n\nКлиент ещё ничего не выбрал.`)
      return
    }

    const lines = selections.map((item) => {
      const markers = item.markers.length
      return `📷 ${item.categoryPath || '—'} / ${item.photoName}\n   меток: ${markers}`
    })

    await ctx.reply(
      `👤 ${link.label || link.clientName}\n\n${lines.join('\n\n')}`,
    )
  })

  bot.action(/^linkedit:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery()
    const linkId = ctx.match[1]
    const links = await CatalogService.listManagerLinks(String(ctx.from!.id))
    const link = links.find(item => item.id === linkId)
    if (!link) {
      await ctx.reply('Ссылка не найдена.')
      return
    }

    const session = getSession(String(ctx.from!.id))
    session.step = 'editing_categories'
    session.editingLinkId = linkId
    session.selectedCategoryIds = [...link.categoryIds]
    session.categoryPage = 0

    const categories = await ensureCategories(session)

    await ctx.reply(
      `Редактирование категорий для «${link.label || link.clientName}»`,
      categoryPickerKeyboard(categories, session.selectedCategoryIds, session.categoryPage),
    )
  })

  bot.action(/^linkdelete:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery()
    const linkId = ctx.match[1]

    try {
      await CatalogService.deleteCatalogLink(linkId, String(ctx.from!.id))
      await ctx.reply('Ссылка удалена.')
    }
    catch {
      await ctx.reply('Не удалось удалить ссылку.')
    }
  })

  bot.action('links:back', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.reply('Главное меню', mainMenuKeyboard())
  })

  bot.launch().then(() => {
    logger.info('[Bot] Telegram bot started')
  })

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
