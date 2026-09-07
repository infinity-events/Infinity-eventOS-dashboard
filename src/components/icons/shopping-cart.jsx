import { motion, useAnimation } from "motion/react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";

const DEFAULT_TRANSITION = {
  duration: 0.6,
  opacity: { duration: 0.2 },
};

const PATH_VARIANTS = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
  },
};

const ShoppingCartIcon = forwardRef(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Corpo del carrello */}
          <motion.path
            animate={controls}
            d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H6"
            transition={DEFAULT_TRANSITION}
            variants={PATH_VARIANTS}
          />

          {/* Ruota sinistra */}
          <motion.circle
            animate={controls}
            cx="10"
            cy="20"
            r="1.2"
            transition={DEFAULT_TRANSITION}
            variants={PATH_VARIANTS}
          />

          {/* Ruota destra */}
          <motion.circle
            animate={controls}
            cx="18"
            cy="20"
            r="1.2"
            transition={DEFAULT_TRANSITION}
            variants={PATH_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

ShoppingCartIcon.displayName = "ShoppingCartIcon";

export { ShoppingCartIcon };