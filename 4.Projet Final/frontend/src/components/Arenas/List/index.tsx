import { Button } from "@chakra-ui/button";
import { List, ListItem, SimpleGrid, Stack, Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePublicClient,
} from "wagmi";
import { arenaFactoryAbi } from "../../../utils/abi";
import { ethers } from "ethers";
import { decodeEventLog, parseAbiItem } from "viem";
import { useArenas } from "../../../context/Arenas";
import CardItem from "./CardItem";

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
  const publicClient = usePublicClient({ chainId: 31337 });
  const { arenas, loadings, arenaCount } = useArenas();
  console.log(loadings);
  return (
    <Stack>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          Arenas List ({arenaCount || (loadings.arenas ? "Loading..." : 0)})
        </Text>
        <Button
          disabled={!isConnected}
          onClick={() => setDisplayForm(true)}
          variant={"outline"}
        >
          Create a new Arena
        </Button>
      </Stack>
      {arenas.length ? (
        <SimpleGrid columns={2} gap={3} mt={3}>
          {arenas.map((arena, i) => (
            <CardItem key={i} contract={arena} />
          ))}
        </SimpleGrid>
      ) : (
        <Text fontSize={"xl"} fontWeight={"bold"}>
          {loadings.arenas ? "Loading..." : "No arenas found"}
        </Text>
      )}
    </Stack>
  );
}
