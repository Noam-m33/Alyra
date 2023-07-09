import { Stack, Text } from "@chakra-ui/layout";
import React from "react";
import { Profile } from "./Profile";

export default function Header() {
  return (
    <header>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        width={"100%"}
      >
        <Text fontSize={"4xl"} fontWeight={"bold"}>
          Gamble Arena
        </Text>
        <Profile />
      </Stack>
    </header>
  );
}
