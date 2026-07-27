
import { motion } from "framer-motion";

export default function MotionUp({
  children,
  delay = 0,
  className = "",
  initialY = 100,
  initialOpacity = 0,
  finalY = 0,
  finalOpacity = 1,
}) {
  return (
    <motion.div
      initial={{ y: initialY, opacity: initialOpacity }}
      whileInView={{ y: finalY, opacity: finalOpacity }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 70,
        mass: 1,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}