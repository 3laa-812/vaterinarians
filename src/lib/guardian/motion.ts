import { Variants } from "motion/react";

export const guardianTransitions = {
  spring: { type: "spring", stiffness: 300, damping: 30 },
  easeOut: { type: "tween", ease: "easeOut", duration: 0.2 },
} as const;

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: guardianTransitions.easeOut,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { ...guardianTransitions.easeOut, duration: 0.15 },
  },
};

export const reducedMotionPageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: guardianTransitions.easeOut,
  },
};

export const reducedMotionStaggerItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};
