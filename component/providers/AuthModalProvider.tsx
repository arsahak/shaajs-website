"use client";

import type { Dictionary } from "@/app/dictionaries";
import { safeCallbackUrl } from "@/app/utils/safe-redirect";
import type { AuthView } from "@/component/auth/AuthForm";
import { AuthModal, type AuthModalState } from "@/component/auth/AuthModal";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface OpenAuthOptions {
  /** Where to land after signing in. Defaults to the page the visitor is on. */
  callbackUrl?: string;
  identifier?: string;
}

interface AuthModalContextValue {
  openAuth: (view?: AuthView, options?: OpenAuthOptions) => void;
  closeAuth: () => void;
}

const AUTH_VIEWS: AuthView[] = ["sign-in", "sign-up", "forgot-password"];

const AuthModalContext = createContext<AuthModalContextValue | undefined>(
  undefined,
);

export function AuthModalProvider({
  dict,
  children,
}: {
  dict: Dictionary;
  children: ReactNode;
}) {
  const [state, setState] = useState<AuthModalState | null>(null);

  const openAuth = useCallback(
    (view: AuthView = "sign-in", options: OpenAuthOptions = {}) => {
      setState({
        view,
        callbackUrl:
          options.callbackUrl ??
          window.location.pathname + window.location.search,
        identifier: options.identifier,
      });
    },
    [],
  );

  const closeAuth = useCallback(() => setState(null), []);

  // "/?auth=sign-in&callbackUrl=…" opens the modal on arrival — where the old
  // sign-in pages and the pages that need an account now send visitors. The
  // parameters are then dropped from the address bar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("auth") as AuthView | null;
    if (!view || !AUTH_VIEWS.includes(view)) return;

    // On the next frame, once the page has painted — the modal then animates
    // in over it instead of appearing with it.
    const frame = requestAnimationFrame(() => {
      const callbackUrl = safeCallbackUrl(params.get("callbackUrl"), "/");
      const identifier = params.get("identifier")?.slice(0, 120);
      for (const name of ["auth", "callbackUrl", "identifier"]) {
        params.delete(name);
      }
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (query ? `?${query}` : ""),
      );
      openAuth(view, { callbackUrl, identifier });
    });
    return () => cancelAnimationFrame(frame);
  }, [openAuth]);

  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      <AuthModal
        dict={dict}
        state={state}
        onClose={closeAuth}
        onSwitchView={(view, options) =>
          setState(
            (current) =>
              current && { ...current, view, identifier: options?.identifier },
          )
        }
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
