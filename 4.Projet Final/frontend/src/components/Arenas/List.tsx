import { Button } from "@chakra-ui/button";
import { List, ListItem, Stack, Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { useState } from "react";
import { useAccount } from "wagmi";

const data = [
  {
    id: 1,
    name: "Arena 1",
    description: "Arena 1 description",
    image: "https://via.placeholder.com/150",
    price: 100,
    owner: "0x1234",
    contractAddress: "0x12348",
    participants: 10,
    isOpen: true,
  },
  {
    id: 2,
    name: "Arena 3",
    description: "Arena 1 description",
    image: "https://via.placeholder.com/150",
    price: 100,
    owner: "0x1234",
    contractAddress: "0x12348",
    participants: 10,
    isOpen: true,
  },
  {
    id: 4,
    name: "Arena 4",
    description: "Arena 1 description",
    image: "https://via.placeholder.com/150",
    price: 100,
    owner: "0x1234",
    contractAddress: "0x12348",
    participants: 10,
    isOpen: true,
  },
];

interface ArenaListProps {
  setDisplayForm: (value: boolean) => void;
}

export function ArenaList({ setDisplayForm }: ArenaListProps) {
  const { isConnected } = useAccount();
  return (
    <Stack>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          Arenas List ({data.length})
        </Text>
        <Button
          disabled={!isConnected}
          onClick={() => setDisplayForm(true)}
          variant={"outline"}
        >
          Create a new Arena
        </Button>
      </Stack>
      <List>
        {data.map((arena) => (
          <ListItem key={arena.id}>
            <Text>{arena.name}</Text>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
