"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
            }
          ) => void;
        };
      };
    };
  }
}

type Props = {
  role?: string;
  text?: "signin_with" | "signup_with" | "continue_with";
  className?: string;
};

export function GoogleSignInButton({
  role,
  text = "continue_with",
  className = "",
}: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !btnRef.current) return;

    const scriptId = "google-gsi-script";
    const existing = document.getElementById(scriptId);

    const init = () => {
      if (!window.google || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setError("");
          setLoading(true);
          try {
            await loginWithGoogle(response.credential, role ? { role } : {});
            router.push("/dashboard");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Google sign-in failed");
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: 360,
        text,
        shape: "pill",
      });
    };

    if (existing) {
      init();
    } else {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    }
  }, [clientId, loginWithGoogle, role, router, text]);

  if (!clientId) {
    return (
      <div className={`text-center text-xs text-muted-foreground ${className}`}>
        Google sign-in will appear once{" "}
        <code className="text-[10px]">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> is set.
      </div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium px-4 py-2">
          {error}
        </div>
      )}
      <div
        ref={btnRef}
        className={`flex justify-center ${loading ? "opacity-60 pointer-events-none" : ""}`}
      />
    </div>
  );
}
