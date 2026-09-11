import { motion, useAnimation } from "motion/react";
import { forwardRef, useImperativeHandle, useRef } from "react";

const CreditCardIcon = forwardRef(({ size = 28, className, ...props }, ref) => {
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
        <motion.rect x="3" y="5" width="18" height="14" rx="2" variants={variants} animate={controls} transition={{ duration: 0.55 }} />
        <motion.path d="M3 10h18" variants={variants} animate={controls} transition={{ duration: 0.45, delay: 0.08 }} />
        <motion.path d="M7 15h3" variants={variants} animate={controls} transition={{ duration: 0.35, delay: 0.16 }} />
      </svg>
    </motion.div>
  );
});

CreditCardIcon.displayName = "CreditCardIcon";

export { CreditCardIcon };
