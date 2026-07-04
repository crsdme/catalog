import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const authContext = useAuthContext()
  const { t } = useLocale()

  const formSchema = useMemo(() =>
    z.object({
      login: z.string({ required_error: t('form.errors.required') })
        .min(3, { message: t('form.errors.min_length', { count: 3 }) })
        .max(50, { message: t('form.errors.max_length', { count: 50 }) })
        .trim(),
      password: z.string({ required_error: t('form.errors.required') })
        .min(3, { message: t('form.errors.min_length', { count: 3 }) })
        .max(50, { message: t('form.errors.max_length', { count: 50 }) })
        .trim(),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    authContext.login(values)
  }

  return (
    <div className={cn('flex flex-col justify-center mx-auto gap-4 max-w-[360px] w-full px-4', className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-center">{t('page.login.form.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground text-center">{t('page.login.form.description')}</p>
      </div>
      <Form {...form}>
        <form
          className="w-full space-y-1"
          onSubmit={(e) => { void form.handleSubmit(onSubmit)(e) }}
        >
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder={t('page.login.form.label.login')} className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder={t('page.login.form.label.password')} className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
            {t('page.login.button.submit')}
          </Button>
        </form>
      </Form>
    </div>
  )
}
