"use client";

import { useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function Footer() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => router.push("/app"),
  });

  return (
    <footer className="border-t border-border px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-display text-3xl text-ink sm:text-4xl">
            Start saving today.
          </p>
          <button
            onClick={() => login()}
            className="mt-8 inline-flex items-center rounded-lg bg-sage px-8 py-3.5 font-mono text-sm font-medium tracking-wide text-cream transition-colors duration-300 hover:bg-sage-light"
          >
            Get Started
          </button>
        </motion.div>

        <div className="mt-24 flex items-center justify-center gap-2">
          <span className="label-mono text-[10px]">Built by</span>
          <span className="font-mono text-xs tracking-wide text-ink-light">
            s0nderlabs
          </span>
        </div>
      </div>
    </footer>
  );
}
