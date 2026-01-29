import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleIcon } from "@/components/ui/google-icon"
import path from "@/constants/path"
import{z}from "zod"
import{useForm} from "react-hook-form"
import{zodResolver} from "@hookform/resolvers/zod"
import { signupFormSchema, type SignupFormValues } from "@/utils/auth.schema"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const navigate = useNavigate();
  const{register,handleSubmit,formState: {errors,isSubmitting}} =useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema)
  });
  const onSubmit = async(data : SignupFormValues)=> {
    // goi backend de sign up
  }
  return (
    <div className={cn("signup-form flex flex-col gap-5", className)} {...props}>
      <Card className="signup-form-card overflow-hidden border border-border bg-card shadow-lg rounded-xl p-0">
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
                  Tạo tài khoản
                </h1>
                <p className="text-sm text-muted-foreground text-balance">
                  Chào mừng bạn, hãy đăng ký để bắt đầu.
                </p>
              </div>

              {/* Họ & Tên */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-2">
                  <Label htmlFor="lastname" className="text-sm font-medium">
                    Họ
                  </Label>
                  <Input
                    type="text"
                    id="lastname"
                    placeholder="Nhập họ"
                    {...register("lastname")}
                  />
                  {errors.lastname && (
                    <p className="mt-1 text-xs text-destructive break-words">
                      {errors.lastname.message}
                    </p>
                  )}

                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <Label htmlFor="firstname" className="text-sm font-medium">
                    Tên
                  </Label>
                  <Input
                    type="text"
                    id="firstname"
                    placeholder="Nhập tên"
                    {...register("firstname")}
                  />
                  {errors.firstname && (
                    <p className="mt-1 text-xs text-destructive break-words">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
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
                  {...register("username")}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-destructive break-words">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Nhập email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive break-words">
                    {errors.email.message}
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
                {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">hoặc</span>
                <Separator className="flex-1" />
              </div>

              {/* Google Signup Button */}
              <Button
                type="button"
                className="btn-auth w-full"
                size="lg"
                onClick={() => {
                  // TODO: Implement Google signup
                  console.log("Google signup clicked")
                }}
              >
                <GoogleIcon className="size-5" />
                Đăng ký với Google
              </Button>

              {/* Login link */}
              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link
                  to={path.login}
                  className="font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms - subtle footer */}
      <p className="text-center text-xs text-muted-foreground/80 px-2">
        Bằng việc đăng ký, bạn đồng ý với{" "}
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
