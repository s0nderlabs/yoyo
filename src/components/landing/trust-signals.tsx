"use client";

import { motion } from "framer-motion";

export function TrustSignals() {
  return (
    <section className="border-t border-border px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="label-mono"
        >
          Built on trust
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <p className="font-display text-3xl leading-snug text-ink sm:text-4xl">
            Powered by{" "}
            <span className="text-sage">YO Protocol</span>
            — the yield optimizer securing $91M+ across
            Ethereum, Base, and Arbitrum.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-wrap gap-x-8 gap-y-4"
        >
          {[
            "$91M+ TVL",
            "Zero fees",
            "Audited",
            "Non-custodial",
            "Multi-chain",
          ].map((signal) => (
            <span
              key={signal}
              className="label-mono border-b border-border pb-1 text-ink-light"
            >
              {signal}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
