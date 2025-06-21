import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const disableAnimation: boolean = location.state?.disableAnimation;
  // define the animation variants conditionally
  const variants = {
    // if animation is disabled, start at full opacity. Otherwise, fade in.
    initial: { opacity: disableAnimation ? 1 : 0 },
    // always animate to full opacity
    animate: { opacity: 1 },
    // If animation is disabled, exit at full opacity. Otherwise, fade out.
    exit: { opacity: disableAnimation ? 1 : 0 },
  };

  return (
    <motion.div
      key={ location.pathname }
      variants={ variants }
      initial="initial"
      animate="animate"
      exit="exit"
      transition={ { duration: disableAnimation ? 0 : 0.4, ease: "easeInOut" } }
      className="flex flex-col h-full"
    >{ children }</motion.div>
  );
}