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

export function ArenaList() {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();
  return (
    <Stack>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Modal body</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant={"ghost"} mr={3} onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button colorScheme="blue">Create arena</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          Arenas List ({data.length})
        </Text>
        <Button
          disabled={!isConnected}
          onClick={() => setIsOpen(true)}
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
