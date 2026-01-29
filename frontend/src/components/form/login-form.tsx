import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import{useForm} from "react-hook-form"
import{zodResolver} from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleIcon } from "@/components/ui/google-icon"
import path from "@/constants/path"
import { signinSchema, type SigninFormValues } from "@/utils/auth.schema"
import {z} from "zod"



export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) { 

  // const{signIn} = useAuthStore();
  const navigate = useNavigate();

   const {register,handleSubmit,formState: {errors,isSubmitting}} = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema)
  });
  const onSubmit = async(data: SigninFormValues) => {
    // const {username,password} = data;

  }

  return (
    <div className={cn("login-form flex flex-col gap-5", className)} {...props}>
      <Card className="login-form-card overflow-hidden border border-border bg-card shadow-lg rounded-xl p-0">
        <CardContent className="p-0">
          <form className="p-5 sm:p-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5">
              {/* Header - Logo & title */}
              <div className="flex flex-col items-center text-center gap-2">
                <Link
                  to={path.home}
                  className="mx-auto block w-fit text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                >
                  <img
                    src="/logo.png"
                    alt="CrownDine"
                    className="h-10 w-auto object-contain"
                  />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  CrownDine
                </h1>
                <p className="text-sm text-muted-foreground text-balance">
                  Chào mừng bạn trở lại.
                </p>
              </div>

              {/* Username */}
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Tên đăng nhập
                </Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  className="h-10 rounded-lg border-input"
                  autoComplete="username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-destructive break-words">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  className="h-10 rounded-lg border-input"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive break-words">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="btn-auth w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">hoặc</span>
                <Separator className="flex-1" />
              </div>

              {/* Google Login Button */}
              <Button
                type="button"
                className="btn-auth w-full"
                size="lg"
                onClick={() => {
                  // TODO: Implement Google login
                  console.log("Google login clicked")
                }}
              >
                <GoogleIcon className="size-5" />
                Đăng nhập với Google
              </Button>

              {/* Signup link */}
              <p className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link
                  to={path.register}
                  className="font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  Đăng ký
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms - subtle footer */}
      <p className="text-center text-xs text-muted-foreground/80 px-2">
        Bằng việc đăng nhập, bạn đồng ý với{" "}
        <a href="#" className="underline underline-offset-2 hover:text-primary">
          Điều khoản sử dụng
        </a>{" "}
        và{" "}
        <a href="#" className="underline underline-offset-2 hover:text-primary">
          Chính sách bảo mật
        </a>
        .
      </p>
    </div>
  )
}
