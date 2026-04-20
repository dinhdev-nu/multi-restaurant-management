import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { SignUpSteps } from "./SignUpSteps"
import { SignInForm } from "./SignInForm"
import { useSignUp } from "../hooks/use-sign-up"
import { useSignIn, type SignInStep } from "../hooks/use-sign-in"
import {
  AUTH_ROUTE_PATHS,
  SIGNIN_STEP_TO_PATH,
  SIGNUP_STEP_TO_PATH,
  isSignUpMode,
  type AuthRouteMode,
} from "../constants"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TAB_ORDER = ["signup", "signin"]

const tabSlideVariants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
}

interface AuthCardProps {
  mode: AuthRouteMode
}

function resolveSignInStep(mode: AuthRouteMode, currentStep: SignInStep): SignInStep {
  switch (mode) {
    case "2fa":
      return "2fa"
    case "forgot-password":
      return "forgot-email"
    case "reset-password-verify":
      return "forgot-otp"
    case "reset-password":
      return currentStep === "forgot-done" ? "forgot-done" : "forgot-reset"
    default:
      return "credentials"
  }
}

export function AuthCard({ mode }: AuthCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const signUpHook = useSignUp()
  const signInHook = useSignIn()
  const [tabDir, setTabDir] = useState(1)
  const activeTab: "signup" | "signin" = isSignUpMode(mode) ? "signup" : "signin"

  const signUpStep = signUpHook.step
  const setSignUpStep = signUpHook.setStep
  const signInStep = signInHook.signInStep
  const setSignInStep = signInHook.setSignInStep

  useEffect(() => {
    if (activeTab === "signup") {
      if (mode === "verify-email") {
        if (signUpStep !== "otp") setSignUpStep("otp")
      } else if (signUpStep === "otp") {
        setSignUpStep("info")
      }

      const normalizedSignUpStep = mode === "verify-email" ? "otp" : signUpStep === "otp" ? "info" : signUpStep
      const targetPath = SIGNUP_STEP_TO_PATH[normalizedSignUpStep]
      if (location.pathname !== targetPath) {
        navigate(targetPath)
      }
      return
    }

    const targetStep = resolveSignInStep(mode, signInStep)
    if (signInStep !== targetStep) {
      setSignInStep(targetStep)
    }
    const targetPath = SIGNIN_STEP_TO_PATH[targetStep]
    if (location.pathname !== targetPath) {
      navigate(targetPath)
    }
  }, [activeTab, location.pathname, mode, navigate, setSignInStep, setSignUpStep, signInStep, signUpStep])

  const switchTab = (newTab: string) => {
    const nextTab = newTab === "signin" ? "signin" : "signup"
    const dir = TAB_ORDER.indexOf(nextTab) > TAB_ORDER.indexOf(activeTab) ? 1 : -1
    setTabDir(dir)

    if (nextTab === "signup") {
      signUpHook.reset()
      navigate(AUTH_ROUTE_PATHS.register)
      return
    }

    signInHook.setSignInStep("credentials")
    navigate(AUTH_ROUTE_PATHS.login)
  }

  const handleClose = () => {
    signUpHook.onClose()
    signInHook.handleBackToSignIn()
    navigate("/")
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="border-border bg-card">
        <CardContent className="p-6 sm:p-8">
          <Tabs value={activeTab} onValueChange={switchTab}>
            <div className="mb-6 flex items-center justify-between gap-3">
              <TabsList className="h-11 flex-1 gap-1 border border-border bg-secondary p-1">
                <TabsTrigger value="signup" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground">Sign up</TabsTrigger>
                <TabsTrigger value="signin" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground">Sign in</TabsTrigger>
              </TabsList>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X />
              </Button>
            </div>
          </Tabs>

          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} custom={tabDir} mode="wait">
              <motion.div
                key={activeTab}
                custom={tabDir}
                variants={tabSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              >
                {activeTab === "signup" ? (
                  <SignUpSteps hook={signUpHook} />
                ) : (
                  <SignInForm hook={signInHook} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Social divider */}
          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium tracking-wide text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={signInHook.handleGoogleLogin}
              className="h-11 gap-2"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png"
                alt="Google"
                width={16}
                height={16}
                className="size-4"
              />
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={signInHook.handleAppleLogin}
              className="h-11 gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple
            </Button>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
