import { XStack, YStack, View, Text } from "tamagui";

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
export default function Board() {
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
    </View>
  );
}
