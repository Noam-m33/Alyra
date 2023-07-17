import { IconButton } from "@chakra-ui/button";
import { ChevronLeftIcon } from "@chakra-ui/icons";

import { Stack, Text } from "@chakra-ui/layout";
import Form from "./Form";

interface CreateArenaProps {
  setDisplayForm: (value: boolean) => void;
}

export default function CreateArena({ setDisplayForm }: CreateArenaProps) {
  return (
    <Stack direction={"column"} gap={10}>
      <Stack direction={"row"}>
        <Stack direction={"row"} alignItems={"center"}>
          <IconButton
            onClick={() => setDisplayForm(false)}
            aria-label="go back button"
            icon={<ChevronLeftIcon />}
          />
          <Text>Go back</Text>
        </Stack>
        <Stack width={"80%"} justifyContent={"center"}>
          <Text fontSize={"xl"} fontWeight={"bold"}>
            Create Arena
          </Text>
        </Stack>
      </Stack>
      <Form />
    </Stack>
  );
}
