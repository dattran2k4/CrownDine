import { z } from 'zod'

export const signinSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 kí tự'),
  password: z.string().min(6, 'Mật khẩu có ít nhất 6 ký tự')
})
export const signupFormSchema = signinSchema
  .extend({
    firstname: z.string().min(1, 'Vui lòng nhập tên của bạn'),
    lastname: z.string().min(1, 'Vui lòng nhập họ của bạn'),
    email: z.string().email('Email không hợp lệ'),
    confirmPassword: z.string().min(6, 'Mật khẩu có ít nhất 6 ký tự')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })
export type SigninFormValues = z.infer<typeof signinSchema>

export type SignupFormValues = z.infer<typeof signupFormSchema>
