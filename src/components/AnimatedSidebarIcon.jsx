import { motion } from "motion/react";

const animations = {
  home: { y: -2, scale: 1.06 },
  calendar: { rotate: [0, -4, 4, 0], scale: 1.04 },
  ticket: { x: [0, -2, 2, 0] },
  radio: { scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] },
  users: { x: [0, -2, 2, 0] },
  wallet: { y: -2, rotate: -3 },
  analytics: { y: [0, -2, 0], scale: 1.05 },
  settings: { rotate: 180 },
};

const transition = {
  type: "spring",
  stiffness: 320,
  damping: 18,
};

export default function AnimatedSidebarIcon({ icon: Icon, name, size = 20 }) {
  return (
    <motion.span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center"
      initial={false}
      transition={transition}
      whileHover={animations[name]}
      whileTap={{ scale: 0.92 }}
    >
      <Icon size={size} />
    </motion.span>
  );
}
