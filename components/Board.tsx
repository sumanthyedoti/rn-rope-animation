import { XStack, YStack, View, Text, ViewProps } from "tamagui";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Pattern,
  Rect,
  Stop,
} from "react-native-svg";
import { useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
  withSpring,
  withSequence,
  useDerivedValue,
} from "react-native-reanimated";
import { LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type PortProps = { onLayout?: (e: LayoutChangeEvent) => void } & ViewProps;
const Port = ({ onLayout, ...props }: PortProps) => {
  return (
    <View
      onLayout={(e) => onLayout && onLayout(e)}
      {...props}
      style={{
        backgroundColor: "#c5c5c5",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(100, 100, 100, 0.2)",
        padding: 8,
      }}
    >
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 10,
          backgroundColor: "#666",
        }}
      />
    </View>
  );
};

type Point = {
  x: number;
  y: number;
};

export default function Board() {
  const boardXY = useRef({ x: 0, y: 0 });
  const pointA = useSharedValue({ x: 0, y: 0 });
  const pointB = useSharedValue({ x: 0, y: 0 });
  const controlX = useDerivedValue(
    () => (pointA.value.x + pointB.value.x) / 2,
    [pointA, pointB]
  );
  const controlY = useDerivedValue(
    () => Math.min(pointA.value.y, pointB.value.y) + 300,
    [pointA, pointB]
  );
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
      cx: pointA.value.x,
      cy: pointA.value.y,
    };
  });

  const pointBKnobAnimatedProps = useAnimatedProps(() => {
    return {
      cx: pointB.value.x,
      cy: pointB.value.y,
    };
  });
  const startAnimation = () => {
    controlY.value = withRepeat(
      withSequence(
        withSpring(200, {
          damping: 11,
          stiffness: 100,
        }),

        withSpring(400, {
          damping: 11,
          stiffness: 100,
        })
      ),
      -1,
      true
    );
  };

  useEffect(() => {
    // startAnimation();
  }, []);
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      console.log("first");
    })
    .onEnd((e) => {
      console.log("second");
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View
        width="70%"
        onLayout={(e) => {
          boardXY.current = {
            x: e.nativeEvent.layout.x,
            y: e.nativeEvent.layout.y,
          };
        }}
      >
        <XStack
          paddingVertical={25}
          paddingHorizontal={40}
          borderRadius={10}
          borderWidth={1}
          borderColor="#c6c6c6"
          shadowColor="gray"
          shadowOpacity={0.2}
          shadowOffset={{
            width: 1,
            height: 1,
          }}
          backgroundColor="#f5f5f5"
          justifyContent="space-between"
          alignItems="center"
        >
          <YStack gap={25} alignItems="center">
            <Text
              style={{ fontSize: 16, fontWeight: "semibold", color: "#666" }}
            >
              Input
            </Text>
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  pointA.value = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                });
              }}
            />
            <Port />
            <Port />
            <Port />
          </YStack>
          <YStack gap={25} alignItems="center">
            <Text
              style={{ fontSize: 16, fontWeight: "semibold", color: "#666" }}
            >
              Output
            </Text>
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  pointB.value = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                });
              }}
            />
            <Port />
            <Port />
            <Port />
          </YStack>
        </XStack>
        <Svg
          height="100%"
          width="100%"
          style={{ left: 0, top: 0, position: "absolute" }}
        >
          {/* Bézier Curve */}
          <AnimatedPath
            animatedProps={pathAnimatedProps}
            stroke="hsl(20, 80%, 73%)"
            strokeWidth="5"
            fill="none"
          />

          {/* Points */}
          <AnimatedCircle
            animatedProps={pointAKnobAnimatedProps}
            r="8"
            fill="hsl(15, 100%, 65%)"
          />
          <AnimatedCircle
            animatedProps={pointBKnobAnimatedProps}
            r="8"
            fill="hsl(100, 66%, 60%)"
          />
        </Svg>
      </View>
    </GestureDetector>
  );
}
