import { ReCaptchaProvider } from "@/components/common/RecaptchaProvider";

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}>
        {children}
      </ReCaptchaProvider>
    </div>
  )
}