"use client";

import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Reveal, RevealGroup } from "@/components/motion/Reveal";
import { staggerItem } from "@/lib/motion";
import { motion } from "motion/react";

const STATS = [
  { value: 100, format: (n: number) => `${Math.round(n)}%`, label: "Entèfas an Kreyòl" },
  { value: 0, format: (n: number) => String(Math.round(n)), label: "Koneksyon obligatwa pou vann" },
  { value: 2, format: (n: number) => String(Math.round(n)), label: "Mwayen peman mobil entegre" },
  { value: 3, format: (n: number) => String(Math.round(n)), label: "Wòl: pwopriyetè, anplwaye, admin" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center md:gap-16">
        <RevealGroup className="grid grid-cols-2 gap-8">
          {STATS.map((stat) => (
            <motion.div key={stat.label} variants={staggerItem} className="flex flex-col gap-1">
              <span className="text-4xl font-extrabold text-foreground sm:text-5xl">
                <AnimatedNumber value={stat.value} format={stat.format} whenInView />
              </span>
              <span className="text-sm text-text-secondary">{stat.label}</span>
            </motion.div>
          ))}
        </RevealGroup>

        <Reveal className="max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Bati pou reyalite yon boutik ayisyen
          </h2>
          <p className="mt-3 text-text-secondary">
            Pa gen konpwomi sou lang, koneksyon, oswa mwayen peman — PatwonPro
            fèt dapre fason boutik yo reyèlman travay an Ayiti.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
