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
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePublicClient,
} from "wagmi";
import { arenaFactoryAbi } from "../../utils/abi";

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
  const { data: arenasCount } = useContractRead({
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: arenaFactoryAbi,
    functionName: "arenaCount",
  });
  const [arenas, setArenas] = useState([]);

  function getArenaAddress(index: number) {
    return publicClient.readContract({
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: arenaFactoryAbi,
      functionName: "getArena",
      args: [index],
    });
  }

  useEffect(() => {
    if (!arenasCount) return;
    const arenasCountFormatted = parseInt(arenasCount as string);
    let arenas = [];
    const promises = new Array(arenasCountFormatted).map((index) => {
      console.log(index);
      getArenaAddress(index);
    });
    Promise.all(promises).then((values) => {
      values.forEach((value) => {
        arenas.push(value);
      });
    });
    setArenas(arenas);
  }, [arenasCount]);

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
