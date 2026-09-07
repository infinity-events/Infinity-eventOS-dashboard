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

const PackageIcon = forwardRef(
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
          {/* Struttura principale della scatola */}
          <motion.path
            animate={controls}
            d="M21 8.5 12 13 3 8.5"
            transition={DEFAULT_TRANSITION}
            variants={PATH_VARIANTS}
          />

          <motion.path
            animate={controls}
            d="M3 8.5V19l9 4 9-4V8.5"
            transition={DEFAULT_TRANSITION}
            variants={PATH_VARIANTS}
          />

          {/* Parte superiore */}
          <motion.path
            animate={controls}
            d="m3 8.5 3-5 6-2 6 2 3 5"
            transition={DEFAULT_TRANSITION}
            variants={PATH_VARIANTS}
          />

          {/* Linea centrale */}
          <motion.path
            animate={controls}
            d="M12 13v10"
            transition={DEFAULT_TRANSITION}
            variants={PATH_VARIANTS}
          />

          {/* Nastro */}
          <motion.path
            animate={controls}
            d="M9 3.5 12 6l3-2.5"
            transition={DEFAULT_TRANSITION}
            variants={PATH_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

PackageIcon.displayName = "PackageIcon";

export { PackageIcon };