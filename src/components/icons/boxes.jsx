import { motion, useAnimation } from "motion/react";
import { forwardRef, useImperativeHandle, useRef } from "react";

const BoxesIcon = forwardRef(({ size = 28, className, ...props }, ref) => {
  const controls = useAnimation();
  const controlled = useRef(false);

  useImperativeHandle(ref, () => {
    controlled.current = true;
    return {
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    };
  });

  const variants = {
    normal: { pathLength: 1, opacity: 1 },
    animate: { pathLength: [0, 1], opacity: [0.3, 1] },
  };

  return (
    <motion.div
      className={className}
      onMouseEnter={() => !controlled.current && controls.start("animate")}
      onMouseLeave={() => !controlled.current && controls.start("normal")}
      {...props}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="m3 7 6-3 6 3-6 3-6-3Z" variants={variants} animate={controls} transition={{ duration: 0.5 }} />
        <motion.path d="M3 7v7l6 3v-7" variants={variants} animate={controls} transition={{ duration: 0.5, delay: 0.08 }} />
        <motion.path d="m15 7 6 3-6 3-6-3 6-3Z" variants={variants} animate={controls} transition={{ duration: 0.5, delay: 0.14 }} />
        <motion.path d="M15 13v7l6-3v-7" variants={variants} animate={controls} transition={{ duration: 0.5, delay: 0.2 }} />
      </svg>
    </motion.div>
  );
});

BoxesIcon.displayName = "BoxesIcon";

export { BoxesIcon };
