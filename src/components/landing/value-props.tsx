"use client";

import { motion } from "framer-motion";

const props = [
  {
    label: "Yield",
    value: "Up to 12%",
    description: "Your money earns while you sleep, automatically optimized across the best opportunities in DeFi.",
  },
  {
    label: "Fees",
    value: "Zero",
    description: "No management fees. No performance fees. No deposit or withdrawal fees. What you earn is yours.",
  },
  {
    label: "Access",
    value: "Anytime",
    description: "Withdraw whenever you need it. Most withdrawals are instant. No lock-ups, no penalties.",
  },
];

export function ValueProps() {
  return (
    <section className="border-t border-border px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="label-mono"
        >
          Why yoyo
        </motion.span>

        <div className="mt-12 grid gap-16 sm:gap-20">
          {props.map((prop, i) => (
            <motion.div
              key={prop.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="grid gap-3 sm:grid-cols-[200px_1fr]"
            >
              <div>
                <span className="label-mono text-sage">{prop.label}</span>
                <p className="mt-1 font-display text-4xl text-ink sm:text-5xl">
                  {prop.value}
                </p>
              </div>
              <p className="font-body text-lg leading-relaxed text-ink-light sm:pt-8">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
