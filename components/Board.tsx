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
import {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  Easing,
  withSpring,
  withSequence,
  useDerivedValue,
} from "react-native-reanimated";
import { LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import MatcherLayer from "./MatcherLayer";

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

export type Point = {
  x: number;
  y: number;
};

export default function Board() {
  const boardXY = useRef({ x: 0, y: 0 });
  const pointA = useSharedValue({ x: 0, y: 0 });
  const pointB = useSharedValue({ x: 0, y: 0 });
  const isHeldPointA = useSharedValue(false);
  const isHeldPointB = useSharedValue(false);

  const currentPointPosition = useRef({ x: 0, y: 0 });

  const isDraggingPoint = (point: Point, fingurePosition: Point) => {
    "worklet";
    return (
      Math.abs(point.x - fingurePosition.x) < 10 &&
      Math.abs(point.y - fingurePosition.y) < 10
    );
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      const draggingPointA = isDraggingPoint(pointA.value, { x: e.x, y: e.y });
      const draggingPointB = isDraggingPoint(pointB.value, { x: e.x, y: e.y });
      if (draggingPointA) {
        isHeldPointA.value = true;
        currentPointPosition.current = pointA.value;
      }
      if (draggingPointB) {
        isHeldPointB.value = true;
        currentPointPosition.current = pointB.value;
      }
    })
    .onUpdate((e) => {
      if (isHeldPointA.value) {
        pointA.value = {x: e.x, y: e.y};
      }
      if (isHeldPointB.value) {
        pointB.value = {x: e.x, y: e.y};
      }
    })
    .onEnd((e) => {
        isHeldPointA.value = false;
        isHeldPointB.value = false;
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
        <MatcherLayer pointA={pointA} pointB={pointB} />
      </View>
    </GestureDetector>
  );
}
