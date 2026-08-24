"use client";

import { motion, useReducedMotion } from "motion/react";
import { staggerContainer, staggerItem, reducedMotionStaggerItem } from "@/lib/guardian/motion";
import { ElementType } from "react";

interface StaggerListProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
}

export function StaggerList({ children, className, as: Component = "ul", ...props }: StaggerListProps) {
  const MotionComponent = motion.create(Component as React.ForwardRefExoticComponent<any>);
  
  return (
    <MotionComponent
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

interface StaggerItemProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
}

export function StaggerItem({ children, className, as: Component = "li", ...props }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = motion.create(Component as React.ForwardRefExoticComponent<any>);

  return (
    <MotionComponent
      variants={shouldReduceMotion ? reducedMotionStaggerItem : staggerItem}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
