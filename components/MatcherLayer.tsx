import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Pattern,
  Rect,
  Stop,
} from "react-native-svg";
import Animated, {
  SharedValue,
  useAnimatedProps,
  useDerivedValue,
  withRepeat,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Point } from "./Board";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  pointA: SharedValue<Point>;
  pointB: SharedValue<Point>;
  isDragging: boolean;
};

export default function MatcherLayer({ pointA, pointB, isDragging }: Props) {
  const controlX = useDerivedValue(
    () => (pointA.value.x + pointB.value.x) / 2,
    [pointA.value.x, pointB.value.x]
  );
  const controlY = useDerivedValue(
    () => withSpring(Math.min(pointA.value.y, pointB.value.y) + (isDragging ? 320 : 240), {
        damping: 8,
        stiffness: 100,
    }),
    [pointA.value.x, pointB.value.x]
  );
  const pointAPosition = useDerivedValue(() => {
    return pointA.value;
  });
  const pointBPosition = useDerivedValue(() => {
    return pointB.value;
  });
  const pathAnimatedProps = useAnimatedProps(() => {
    const { x: x1, y: y1 } = pointA.value;
    const { x: cx, y: cy } = { x: controlX.value, y: controlY.value };
    const { x: x2, y: y2 } = pointB.value;
    const path = `M ${x1} ${y1} Q ${cx} ${cy}, ${x2} ${y2}`;
    return {
      d: path,
    };
  });

  const pointAKnobAnimatedProps = useAnimatedProps(() => {
    return {
      cx: pointAPosition.value.x,
      cy: pointAPosition.value.y,
    };
  }, [pointAPosition]);

  const pointBKnobAnimatedProps = useAnimatedProps(() => {
    return {
      cx: pointBPosition.value.x,
      cy: pointBPosition.value.y,
    };
  }, [pointBPosition]);

  return (
    <Svg
      height="100%"
      width="100%"
      style={{ left: 0, top: 0, position: "absolute" }}
    >
      {/* Points */}
      <AnimatedCircle
        animatedProps={pointAKnobAnimatedProps}
        stroke="hsl(15, 100%, 30%)"
        strokeWidth={1}
        r="8"
        fill="hsl(15, 100%, 65%)"
      />
      <AnimatedCircle
        animatedProps={pointBKnobAnimatedProps}
        stroke="hsl(100, 66%, 30%)"
        strokeWidth={1}
        r="8"
        fill="hsl(100, 66%, 60%)"
      />
      {/* Bézier Curve */}
      <AnimatedPath
        animatedProps={pathAnimatedProps}
        stroke="hsl(20, 80%, 73%)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
