import { XStack, YStack, View, Text } from "tamagui";
import Svg, { Path, Circle } from "react-native-svg";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const Port = () => {
  return (
    <View
      style={{
        backgroundColor: "#c5c5c5",
        borderRadius: 20,
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
}
const createPath = (pointA: Point, controlPoint: Point, pointB: Point) => {
  const { x: x1, y: y1 } = pointA;
  const { x: cx, y: cy } = controlPoint;
  const { x: x2, y: y2 } = pointB;

  return `M ${x1} ${y1} Q ${cx} ${cy}, ${x2} ${y2}`;
};

export default function Board() {
  const pointA = useSharedValue({ x: 50, y: 100 });
  const pointB = useSharedValue({ x: 200, y: 200 });
  const controlX = useSharedValue(100);
  const controlY = useSharedValue(400);
const animatedProps = useAnimatedProps(() => {
    // draw a circle
  const path = `M ${pointA.value.x} ${pointA.value.y} Q ${controlX.value} ${controlY.value}, ${pointB.value.x} ${pointB.value.y}`;
    return {
      d: path,
    };
  });

  return (
    <View width="70%">
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
          <Text style={{ fontSize: 16, fontWeight: "semibold", color: "#666" }}>
            Input
          </Text>
          <Port />
          <Port />
          <Port />
          <Port />
        </YStack>
        <YStack gap={25} alignItems="center">
          <Text style={{ fontSize: 16, fontWeight: "semibold", color: "#666" }}>
            Output
          </Text>
          <Port />
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
          animatedProps={animatedProps}
        //   d={createPath(pointA.value, { x: controlX.value, y: controlY.value }, pointB.value)}
          stroke="blue"
          strokeWidth="5"
          fill="none"
        />

        {/* Points */}
        <Circle cx={pointA.value.x} cy={pointA.value.y} r="5" fill="red" />
        <Circle cx={pointB.value.x} cy={pointB.value.y} r="5" fill="green" />
      </Svg>
    </View>
  );
}
