"use client";

import { useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function HeroSection() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => router.push("/app"),
  });

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-6">
      {/* Decorative large background text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
      >
        <span className="font-display text-[clamp(200px,40vw,500px)] leading-none text-ink/[0.02] italic">
          yo
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-7xl tracking-tight text-ink sm:text-8xl"
        >
          yoyo
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-6 font-body text-xl text-ink-light sm:text-2xl"
        >
          Onchain savings made easy.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-10"
        >
          <button
            onClick={() => login()}
            className="inline-flex items-center rounded-lg bg-sage px-8 py-3.5 font-mono text-sm font-medium tracking-wide text-cream transition-colors duration-300 hover:bg-sage-light"
          >
            Get Started
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="label-mono text-[10px]">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-6 w-px bg-border"
          />
        </div>
      </motion.div>
    </section>
  );
}
