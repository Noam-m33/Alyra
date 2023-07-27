import { ArenaType } from "../../../utils/types";
import { Stack, Text } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";
import { BigNumber, utils } from "ethers";
import { Button, IconButton } from "@chakra-ui/button";
import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePublicClient,
} from "wagmi";
import { arenaAbi } from "../../../utils/abi";
import { useToast } from "@chakra-ui/toast";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { getAddress } from "@ethersproject/address";
import axios from "axios";
import { useArenas } from "../../../context/Arenas";

export default function Details({
  contract,
  setDisplayDetailsContract,
}: {
  contract: ArenaType;
  setDisplayDetailsContract: (display: false) => void;
}) {
  const toast = useToast();
  const account = useAccount();
  const [ownedTokensIds, setOwnedTokensIds] = useState<number[] | null>(null);
  const publicClient = usePublicClient();
  const [fixturesData, setFixturesData] = useState<any[] | null>(null);
  const [selectedBets, setSelectedBets] = useState<
    { id: number; bet: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { setArenaDataIsUpToDate } = useArenas();
  const [winnersState, setWinnersState] = useState<string[]>([]);

  useEffect(() => {
    console.log("useEffect", contract.participantsNumber);
    async function setTokenIds() {
      for (let i = 0; i < contract.participantsNumber; i++) {
        console.log(i);
        const data = await publicClient.readContract({
          address: contract.address as `0x${string}`,
          abi: arenaAbi,
          functionName: "ownerOf",
          args: [i + 1],
        });
        console.log(data, account.address);
        if (
          data &&
          account.address &&
          getAddress(data as string) === getAddress(account.address as string)
        ) {
          console.log("setOwnedTokensIds");

          setOwnedTokensIds((prev) => {
            if (prev?.includes(i + 1)) return prev;
            return [...(prev || []), i + 1];
          });
        }
      }
    }
    setTokenIds();
  }, [account.address, contract.address, publicClient]);

  const baseUrl = "https://us-central1-poc-royal-freebet.cloudfunctions.net/";
  console.log(fixturesData);

  useContractEvent({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    eventName: "BetPlaced",
    listener(log) {
      console.log(log);
    },
  });

  useEffect(() => {
    const getGames = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseUrl}getFixturesProxi`, {
          params: {
            fixtureIds: contract.games.map((game) => game.id),
          },
        });
        setFixturesData(res.data);
      } catch (error) {
        console.log(error, "error");
      } finally {
        setLoading(false);
      }
    };
    getGames();
  }, [contract.games]);

  publicClient.getLogs({});

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
    onSuccess: () => {
      setArenaDataIsUpToDate(false);
      toast({
        title: "Success",
        description: "You have successfully joined the arena",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const { write: placeBetsWrite } = useContractWrite({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    functionName: "placeBets",
    args: [
      contract.games.map((bet) => {
        const prono = selectedBets.find((b) => b.id === bet.id);
        return [prono?.id.toString(), prono?.bet.toString()];
      }),
      [Number(ownedTokensIds?.[0] || 0).toString()],
    ],
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully placed your bets",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const { data } = useContractRead({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    functionName: "balanceOf",
    args: [account.address],
    watch: true,
  });

  const { write: handleCloseArena } = useContractWrite({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    functionName: "closeArena",
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully closed the arena",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const { write: claim } = useContractWrite({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    functionName: "claim",
    args: [ownedTokensIds?.[0]],
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully claim your rewards",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const { data: arenaStatus } = useContractRead({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    functionName: "status",
    watch: true,
  });

  useContractEvent({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    eventName: "BetPlaced",
    listener(log) {
      console.log(log);
    },
  });
  useContractEvent({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    eventName: "WinnersSet",
    listener(log) {
      console.log(log, "log");
      const data = (log[0] as unknown as { args: { winners: number[] } }).args;
      setWinnersState((data.winners as []) || []);
    },
  });

  console.log(winnersState);

  const { write: handleSetResult } = useContractWrite({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    functionName: "setFixturesResult",
    args: [
      contract.games.map((bet) => {
        const prono = selectedBets.find((b) => b.id === bet.id);
        return [prono?.id.toString(), 2, prono?.bet.toString()];
      }),
    ],
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully set the result",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
  });
  const { write: handleSetWinners } = useContractWrite({
    address: contract.address as `0x${string}`,
    abi: arenaAbi,
    functionName: "setWinners",
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully set the winners",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const isWinner = winnersState.find(
    (tokenId) => (tokenId as unknown as number) == ownedTokensIds?.[0]
  );

  console.log(isWinner, winnersState);

  console.log(arenaStatus);

  if (!account.address) {
    return <Text>Please connect your wallet</Text>;
  }

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Stack direction={"column"} gap={10}>
      <Stack direction={"row"}>
        <Stack direction={"row"} alignItems={"center"}>
          <IconButton
            onClick={() => setDisplayDetailsContract(false)}
            aria-label="go back button"
            icon={<ChevronLeftIcon />}
          />
          <Text>Go back</Text>
        </Stack>
        <Stack width={"80%"} justifyContent={"center"}>
          <Text fontSize={"xl"} fontWeight={"bold"}>
            Arena: {contract?.name}
          </Text>
        </Stack>
      </Stack>
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
      <Text>
        You owned the nft token id number: {ownedTokensIds?.toString()}{" "}
      </Text>
      {arenaStatus == "0" && (
        <Stack>
          <Stack flexDir={"row"}>
            {fixturesData?.map((fixture) => (
              <Stack
                key={fixture.id}
                width={"100%"}
                background={"gray.700"}
                p={3}
                borderRadius={5}
              >
                <Stack direction={"row"} justifyContent={"center"}>
                  <Image
                    src={fixture.teams.home.logo}
                    width={5}
                    height={5}
                    aspectRatio={1 / 1}
                    borderRadius={10}
                  />
                  <Text>{fixture.teams.home.name} - </Text>
                  <Image
                    src={fixture.teams.away.logo}
                    width={5}
                    height={5}
                    aspectRatio={1 / 1}
                    borderRadius={10}
                  />
                  <Text>{fixture.teams.away.name}</Text>
                </Stack>
                <Stack flexDir="row" justifyContent={"center"}>
                  <Button
                    background={
                      selectedBets.find(
                        (el) => el.id === fixture.fixture.id && el.bet === 1
                      )
                        ? "green.500"
                        : undefined
                    }
                    onClick={() => {
                      if (
                        selectedBets.find((el) => el.id === fixture.fixture.id)
                      ) {
                        setSelectedBets((prev) =>
                          prev?.filter((el) => el.id !== fixture.fixture.id)
                        );
                      }
                      setSelectedBets((prev) => [
                        ...(prev || []),
                        { id: fixture.fixture.id, bet: 1 },
                      ]);
                    }}
                  >
                    1
                  </Button>
                  <Button
                    background={
                      selectedBets.find(
                        (el) => el.id === fixture.fixture.id && el.bet === 2
                      )
                        ? "green.500"
                        : undefined
                    }
                    onClick={() => {
                      if (
                        selectedBets.find((el) => el.id === fixture.fixture.id)
                      ) {
                        setSelectedBets((prev) =>
                          prev?.filter((el) => el.id !== fixture.fixture.id)
                        );
                      }
                      setSelectedBets((prev) => [
                        ...(prev || []),
                        { id: fixture.fixture.id, bet: 2 },
                      ]);
                    }}
                  >
                    X
                  </Button>
                  <Button
                    background={
                      selectedBets.find(
                        (el) => el.id === fixture.fixture.id && el.bet === 3
                      )
                        ? "green.500"
                        : undefined
                    }
                    onClick={() => {
                      if (
                        selectedBets.find((el) => el.id === fixture.fixture.id)
                      ) {
                        setSelectedBets((prev) =>
                          prev?.filter((el) => el.id !== fixture.fixture.id)
                        );
                      }
                      setSelectedBets((prev) => [
                        ...(prev || []),
                        { id: fixture.fixture.id, bet: 3 },
                      ]);
                    }}
                  >
                    2
                  </Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
          <Stack direction={"row"} justifyContent={"center"}>
            {account.address === contract.creator ? (
              <Stack direction={"row"} justifyContent={"center"}>
                <Button onClick={() => handleCloseArena()}>Close Arena</Button>
              </Stack>
            ) : null}
            {contract.isPrivate ? (
              <Button disabled>
                <Text>🔒 Private</Text>
              </Button>
            ) : (
              <Button
                onClick={() =>
                  ownedTokensIds && ownedTokensIds.length > 0
                    ? placeBetsWrite()
                    : write()
                }
                colorScheme="green"
              >
                <Text>
                  {ownedTokensIds && ownedTokensIds.length > 0
                    ? "Place bets 🎯"
                    : "Join 🔥"}
                </Text>
              </Button>
            )}
          </Stack>
        </Stack>
      )}
      {arenaStatus == "1" && (
        <Stack>
          <Stack flexDir={"row"}>
            {fixturesData?.map((fixture) => (
              <Stack
                key={fixture.id}
                width={"100%"}
                background={"gray.700"}
                p={3}
                borderRadius={5}
              >
                <Stack direction={"row"} justifyContent={"center"}>
                  <Image
                    src={fixture.teams.home.logo}
                    width={5}
                    height={5}
                    aspectRatio={1 / 1}
                    borderRadius={10}
                  />
                  <Text>{fixture.teams.home.name} - </Text>
                  <Image
                    src={fixture.teams.away.logo}
                    width={5}
                    height={5}
                    aspectRatio={1 / 1}
                    borderRadius={10}
                  />
                  <Text>{fixture.teams.away.name}</Text>
                </Stack>
                <Stack flexDir="row" justifyContent={"center"}>
                  <Button
                    background={
                      selectedBets.find(
                        (el) => el.id === fixture.fixture.id && el.bet === 1
                      )
                        ? "green.500"
                        : undefined
                    }
                    onClick={() => {
                      if (
                        selectedBets.find((el) => el.id === fixture.fixture.id)
                      ) {
                        setSelectedBets((prev) =>
                          prev?.filter((el) => el.id !== fixture.fixture.id)
                        );
                      }
                      setSelectedBets((prev) => [
                        ...(prev || []),
                        { id: fixture.fixture.id, bet: 1 },
                      ]);
                    }}
                  >
                    1
                  </Button>
                  <Button
                    background={
                      selectedBets.find(
                        (el) => el.id === fixture.fixture.id && el.bet === 2
                      )
                        ? "green.500"
                        : undefined
                    }
                    onClick={() => {
                      if (
                        selectedBets.find((el) => el.id === fixture.fixture.id)
                      ) {
                        setSelectedBets((prev) =>
                          prev?.filter((el) => el.id !== fixture.fixture.id)
                        );
                      }
                      setSelectedBets((prev) => [
                        ...(prev || []),
                        { id: fixture.fixture.id, bet: 2 },
                      ]);
                    }}
                  >
                    X
                  </Button>
                  <Button
                    background={
                      selectedBets.find(
                        (el) => el.id === fixture.fixture.id && el.bet === 3
                      )
                        ? "green.500"
                        : undefined
                    }
                    onClick={() => {
                      if (
                        selectedBets.find((el) => el.id === fixture.fixture.id)
                      ) {
                        setSelectedBets((prev) =>
                          prev?.filter((el) => el.id !== fixture.fixture.id)
                        );
                      }
                      setSelectedBets((prev) => [
                        ...(prev || []),
                        { id: fixture.fixture.id, bet: 3 },
                      ]);
                    }}
                  >
                    2
                  </Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
          <Stack direction={"row"} justifyContent={"center"}>
            <Button onClick={() => handleSetResult()} colorScheme="green">
              <Text>Set Result</Text>
            </Button>
          </Stack>
        </Stack>
      )}
      {arenaStatus == "2" && (
        <Stack direction={"row"} justifyContent={"center"}>
          <Button onClick={() => handleSetWinners()} colorScheme="green">
            <Text>Set Winners</Text>
          </Button>
        </Stack>
      )}
      {arenaStatus == "3" && isWinner && (
        <Stack direction={"row"} justifyContent={"center"}>
          <Button onClick={() => claim()} colorScheme="green">
            <Text>Claim</Text>
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
