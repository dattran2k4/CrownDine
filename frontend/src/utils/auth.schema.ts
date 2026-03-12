import { z } from 'zod'

export const signinSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 kí tự'),
  password: z.string().min(6, 'Mật khẩu có ít nhất 6 ký tự')
})
export const signupBaseSchema = signinSchema
  .extend({
    firstName: z.string().min(1, 'Vui lòng nhập tên của bạn'),
    lastName: z.string().min(1, 'Vui lòng nhập họ của bạn'),
    phone: z
      .string()
      .min(10, 'Số điện thoại phải có ít nhất 10 chữ số')
      .max(15, 'Số điện thoại không được vượt quá 15 chữ số')
      .regex(/^\+?[0-9\s\-()]+$/, 'Định dạng số điện thoại không hợp lệ'),
    email: z.string().email('Email không hợp lệ'),
    confirmPassword: z.string().min(6, 'Mật khẩu có ít nhất 6 ký tự')
  })

export const signupFormSchema = signupBaseSchema
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })
export type SigninFormValues = z.infer<typeof signinSchema>

export type SignupFormValues = z.infer<typeof signupFormSchema>

export const createStaffSchema = signupBaseSchema.omit({ confirmPassword: true })

export type CreateStaffValues = z.infer<typeof createStaffSchema>
