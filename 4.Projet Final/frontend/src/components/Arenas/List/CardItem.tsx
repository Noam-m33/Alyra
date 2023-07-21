import { ArenaType } from "../../../utils/types";
import { Stack, Text } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";
import { BigNumber, utils } from "ethers";
import { Button } from "@chakra-ui/button";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { arenaAbi } from "../../../utils/abi";
import { useToast } from "@chakra-ui/toast";

export default function CardItem({
  contract,
  setDisplayDetailsContract,
}: {
  contract: ArenaType;
  setDisplayDetailsContract: (contract: ArenaType) => void;
}) {
  const toast = useToast();
  const account = useAccount();
  const { write } = useContractWrite({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    functionName: "register",
    value: BigInt(
      utils.parseUnits(contract.entryCost.toString(), "ether").toString()
    ),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: "You have successfully joined the arena",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const { data, error } = useContractRead({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    functionName: "balanceOf",
    args: [account.address],
  });

  return (
    <Stack
      sx={{
        backgroundColor: "#ffffff1b",
        borderRadius: "10px",
        padding: "10px",
      }}
      width={"100%"}
    >
      <Text fontWeight={"semibold"}>
        {contract.name}{" "}
        {account.address === contract.creator && "(You are the creator)"}
      </Text>
      <Text>{contract.address}</Text>
      <Text>Number of games: {contract.games.length}</Text>
      <Text>
        Number of participants: {contract.participantsNumber}{" "}
        {data ? ` (you have ${BigNumber.from(data).toString()} tickets)` : ""}
      </Text>
      <Stack direction={"row"} justifyContent={"center"}>
        <Text fontWeight={"semibold"}>Entry Cost</Text>
        <Image
          height={6}
          width={6}
          src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Ethereum-ETH-icon.png"
        />
        <Text fontWeight={"semibold"}>{contract.entryCost}</Text>
      </Stack>
      <Stack direction={"row"} justifyContent={"center"}>
        <Button onClick={() => setDisplayDetailsContract(contract)}>
          <Text>View Details 👀</Text>
        </Button>
        {contract.isPrivate ? (
          <Button disabled>
            <Text>🔒 Private</Text>
          </Button>
        ) : (
          <Button onClick={() => write()} colorScheme="green">
            <Text>Join 🔥</Text>
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
