"use client";

import type { Dictionary } from "@/app/dictionaries";
import { AuthForm, type AuthView } from "@/component/auth/AuthForm";
import { ForgotPasswordForm } from "@/component/auth/ForgotPasswordForm";
import { easeSmooth } from "@/component/motion/variants";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type MouseEvent } from "react";

export interface AuthModalState {
  view: AuthView;
  /** Where a successful sign-in lands. */
  callbackUrl: string;
  /** Email/phone carried from the sign-in form to "Forgot password". */
  identifier?: string;
}

interface AuthModalProps {
  dict: Dictionary;
  /** `null` while the modal is closed. */
  state: AuthModalState | null;
  onClose: () => void;
  onSwitchView: (view: AuthView, options?: { identifier?: string }) => void;
}

/**
 * Sign in, sign up and password reset in a dialog over the current page, so
 * signing in never takes the visitor away from what they were doing.
 */
export function AuthModal({
  dict,
  state,
  onClose,
  onSwitchView,
}: AuthModalProps) {
  const open = state !== null;

  // While open: Escape closes it, and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Closes on a press that starts on the backdrop itself — not one that
  // starts inside the form and ends outside it (selecting text, say).
  const closeOnBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          key="auth-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: easeSmooth }}
          className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 backdrop-blur-sm"
        >
          <div
            onMouseDown={closeOnBackdrop}
            className="flex min-h-full items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={
                state.view === "sign-up" ? dict.nav.sign_up : dict.nav.sign_in
              }
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: easeSmooth }}
              className="relative w-full max-w-[540px] rounded-(--radius-2xl) bg-(--color-surface) p-6 shadow-(--shadow-xl) sm:p-8"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-(--color-bg) p-0 text-(--color-dark) transition-colors hover:bg-(--color-border)"
              >
                <X className="h-[18px] w-[18px] shrink-0" />
              </button>

              {state.view === "forgot-password" ? (
                <ForgotPasswordForm
                  dict={dict}
                  initialIdentifier={state.identifier}
                  callbackUrl={state.callbackUrl}
                  onSwitchView={onSwitchView}
                />
              ) : (
                <AuthForm
                  mode={state.view}
                  dict={dict}
                  callbackUrl={state.callbackUrl}
                  onSwitchView={onSwitchView}
                  onClose={onClose}
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
