"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function useHandleLogin() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();
  const justLoggedIn = useRef(false);

  useEffect(() => {
    if (ready && authenticated && justLoggedIn.current) {
      router.push("/app");
    }
  }, [ready, authenticated, router]);

  const handleLogin = () => {
    if (authenticated) {
      router.push("/app");
      return;
    }
    justLoggedIn.current = true;
    login();
  };

  return handleLogin;
}
