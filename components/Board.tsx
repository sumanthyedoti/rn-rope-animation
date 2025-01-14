import { XStack, YStack, View, Text, ViewProps } from "tamagui";
import { useEffect, useRef, useState } from "react";
import {
  useSharedValue,
  SharedValue,
  runOnUI,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { LayoutChangeEvent, Share } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import MatcherLayer from "./MatcherLayer";

type PortProps = { onLayout?: (e: LayoutChangeEvent) => void } & ViewProps;
const Port = ({ onLayout, ...props }: PortProps) => {
  return (
    <View
      onLayout={(e) => onLayout && onLayout(e)}
      {...props}
      style={{
        backgroundColor: "#e5e5e5",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(100, 100, 100, 0.2)",
        padding: 7,
        elevation: 3,
        shadowColor: "#888",
        shadowOffset: {width: 1, height: 1},
        shadowRadius: 6,
        shadowOpacity: 0.3,
      }}
    >
      <View
        style={{
          width: 15,
          height: 15,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: "#a9a9a9",
          backgroundColor: "#333",
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
  const inputPoints = useSharedValue<Point[]>([]);
  const outputPoints = useSharedValue<Point[]>([]);
  const currentPointAPosition = useSharedValue({ x: 0, y: 0 });
  const currentPointBPosition = useSharedValue({ x: 0, y: 0 });
  const isHeldPointA = useSharedValue(false);
  const isHeldPointB = useSharedValue(false);
  const dragVelocity = useSharedValue({x: 0, y: 0});
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingPoint = (point: Point, fingurePosition: Point) => {
    "worklet";
    return (
      Math.abs(point.x - fingurePosition.x) < 10 &&
      Math.abs(point.y - fingurePosition.y) < 10
    );
  };

  const isDraggedToAPort = (list: SharedValue<Point[]>, position: Point) => {
    "worklet";
    const { x, y } = position;
    return list.value.find((c) => (x - c.x) ** 2 + (y - c.y) ** 2 <= 25 ** 2);
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      const draggingPointA = isDraggingPoint(pointA.value, {
        x: e.x,
        y: e.y,
      });
      const draggingPointB = isDraggingPoint(pointB.value, {
        x: e.x,
        y: e.y,
      });
      if (draggingPointA) {
        isHeldPointA.value = true;
        currentPointAPosition.value = pointA.value;
      }
      if (draggingPointB) {
        isHeldPointB.value = true;
        currentPointBPosition.value = pointB.value;
      }
    })
    .onUpdate((e) => {
      dragVelocity.value = {x: e.velocityX, y: e.velocityY}
      if (isHeldPointA.value) {
        pointA.value = { x: e.x, y: e.y };
      }
      if (isHeldPointB.value) {
        pointB.value = { x: e.x, y: e.y };
      }
      runOnJS(setIsDragging)(true);
    })
    .onEnd((e) => {
      const position = { x: e.x, y: e.y };
      dragVelocity.value = {x: 0, y: 0}
      if (isHeldPointA.value) {
        const draggedPort = isDraggedToAPort(inputPoints, position);
        if (!draggedPort) {
          pointA.value = withSpring(currentPointAPosition.value, {
            damping: 100,
            stiffness: 400,
            mass: 1,
          });
        } else {
          pointA.value = withSpring(draggedPort, {
            damping: 100,
            stiffness: 400,
            mass: 1,
          });
          currentPointAPosition.value = draggedPort;
        }
      }
      if (isHeldPointB.value) {
        const draggedPort = isDraggedToAPort(outputPoints, position);
        if (!draggedPort) {
          pointB.value = withSpring(currentPointBPosition.value, {
            damping: 100,
            stiffness: 400,
            mass: 1,
          });
        } else {
          pointB.value = withSpring(draggedPort, {
            damping: 100,
            stiffness: 400,
            mass: 1,
          });
          currentPointBPosition.value = draggedPort;
        }
      }
      isHeldPointA.value = false;
      isHeldPointB.value = false;
      runOnJS(setIsDragging)(false);
    });

  const addPointPosition = (list: SharedValue<Point[]>, position: Point) => {
    "worklet";
    list.value.push(position);
  };

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
          paddingBottom={100}
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
              style={{
                fontSize: 16,
                fontWeight: "semibold",
                color: "#666",
                marginBottom: 20,
              }}
            >
              Input
            </Text>
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  const position: Point = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                  pointA.value = position;
                  runOnUI(addPointPosition)(inputPoints, position);
                });
              }}
            />
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  const position: Point = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                  runOnUI(addPointPosition)(inputPoints, position);
                });
              }}
            />
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  const position: Point = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                  runOnUI(addPointPosition)(inputPoints, position);
                });
              }}
            />
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  const position: Point = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                  runOnUI(addPointPosition)(inputPoints, position);
                });
              }}
            />
          </YStack>
          <YStack gap={25} alignItems="center">
            <Text
              style={{
                fontSize: 16,
                fontWeight: "semibold",
                color: "#666",
                marginBottom: 20,
              }}
            >
              Output
            </Text>
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  const position: Point = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                  pointB.value = position;
                  runOnUI(addPointPosition)(outputPoints, position);
                });
              }}
            />
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  const position: Point = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                  runOnUI(addPointPosition)(outputPoints, position);
                });
              }}
            />
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  const position: Point = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                  runOnUI(addPointPosition)(outputPoints, position);
                });
              }}
            />
            <Port
              onLayout={(e) => {
                e.currentTarget.measureInWindow((x, y, width, height) => {
                  const position: Point = {
                    x: x - boardXY.current.x + width / 2,
                    y: y - boardXY.current.y + height / 2,
                  };
                  runOnUI(addPointPosition)(outputPoints, position);
                });
              }}
            />
          </YStack>
        </XStack>
        <MatcherLayer velocity={dragVelocity} isDragging={isDragging} pointA={pointA} pointB={pointB} />
      </View>
    </GestureDetector>
  );
}
