"use client";

import CountUp from "react-countup";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function RevenueAnimated() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <span ref={ref}>
      +&nbsp;US$
      {inView ? (
        <CountUp
          start={0}
          end={1.5}
          decimals={1}
          duration={2.5}
          useEasing
          easingFn={(t, b, c, d) => {
            // easeOutExpo
            return t === d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
          }}
        />
      ) : (
        "0.0"
      )}
      M
    </span>
  );
}
