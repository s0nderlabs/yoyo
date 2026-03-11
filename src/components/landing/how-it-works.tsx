"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Sign up in seconds",
    description: "Email, Google, or Apple. No wallet needed, no seed phrases. We create a secure account for you.",
  },
  {
    number: "02",
    title: "Set a savings goal",
    description: "Vacation fund, emergency savings, or just growing your money. Your AI advisor helps you plan.",
  },
  {
    number: "03",
    title: "Start earning",
    description: "Deposit and your money starts earning immediately. We find the best yields and manage everything for you.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="label-mono"
        >
          How it works
        </motion.span>

        <div className="mt-12 grid gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex gap-6 border-b border-border py-10 first:pt-0 last:border-0 last:pb-0"
            >
              <span className="font-mono text-sm text-sage/60">{step.number}</span>
              <div>
                <h3 className="font-display text-2xl text-ink">{step.title}</h3>
                <p className="mt-2 font-body text-base leading-relaxed text-ink-light">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
