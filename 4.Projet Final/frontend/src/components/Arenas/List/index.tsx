import { Button } from "@chakra-ui/button";
import { SimpleGrid, Stack, Text } from "@chakra-ui/layout";
import { useAccount } from "wagmi";
import { useArenas } from "../../../context/Arenas";
import CardItem from "./CardItem";
import { ArenaType } from "../../../utils/types";

interface ArenaListProps {
  setDisplayForm: (value: boolean) => void;
  setDisplayDetailsContract: (contract: ArenaType) => void;
}

export function ArenaList({
  setDisplayForm,
  setDisplayDetailsContract,
}: ArenaListProps) {
  const { isConnected } = useAccount();
  const { arenas, loadings, arenaCount } = useArenas();
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
            <CardItem
              key={i}
              contract={arena}
              setDisplayDetailsContract={setDisplayDetailsContract}
            />
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
