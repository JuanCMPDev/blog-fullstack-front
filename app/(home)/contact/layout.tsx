import { ReCaptchaProvider } from "@/components/common/RecaptchaProvider";

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}>
      {children}
    </ReCaptchaProvider>
  )
}
