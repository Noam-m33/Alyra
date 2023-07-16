"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useContractEvent, useContractRead, usePublicClient } from "wagmi";
import { arenaAbi, arenaFactoryAbi } from "../utils/abi";
import { parseAbiItem } from "viem";
import { BigNumber, utils } from "ethers";
import { ArenaType } from "../utils/types";

type ArenasContextType = {
  arenaCount: number | null;
  createdArenasAddresses: string[];
  arenas: ArenaType[];
  loadings: { arenas: boolean };
};

export const ArenasContext = createContext<ArenasContextType | null>(null);

export const ArenasProvider = ({ children }: { children: ReactNode }) => {
  const [loadings, setLoadings] = useState<{ arenas: boolean }>({
    arenas: true,
  });
  const [arenaCount, setArenaCount] = useState<number | null>(null);
  const publicClient = usePublicClient({ chainId: 31337 });
  const [createdArenasAddresses, setCreatedArenasAddresses] = useState<
    string[]
  >([]);
  const [arenas, setArenas] = useState<ArenaType[]>([]);

  const { data: arenasCountNotFormatted } = useContractRead({
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: arenaFactoryAbi,
    functionName: "arenaCount",
    watch: true,
  });

  useEffect(() => {
    if (BigNumber.from(arenasCountNotFormatted as string).toNumber() === 0) {
      setLoadings((prev) => ({ ...prev, arenas: false }));
    }
    if (arenasCountNotFormatted) {
      setArenaCount(
        BigNumber.from(arenasCountNotFormatted as string).toNumber()
      );
    }
  }, [arenasCountNotFormatted]);

  useEffect(() => {
    if (!arenaCount) return;
    const promises = [];

    for (let i = 0; i < arenaCount; i++) {
      promises.push(
        publicClient.readContract({
          address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          abi: arenaFactoryAbi,
          functionName: "getArena",
          args: [i + 1],
        })
      );
    }

    Promise.all(promises).then((values) => {
      setCreatedArenasAddresses(values as string[]);
    });
  }, [arenaCount]);

  //   publicClient
  //     ?.getLogs({
  //       address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  //       event: parseAbiItem("event ArenaCreated(uint arenaId)"),
  //       fromBlock: BigInt(0),
  //     })
  //     .then((e) => console.log("hi", e))
  //     .catch(console.error);

  useContractEvent({
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: arenaFactoryAbi,
    eventName: "ArenaCreated",
    chainId: 31337,
    listener: (log) => {
      console.log(log, "hi frim event");
    },
  });

  useEffect(() => {
    createdArenasAddresses.map((address) => {
      if (arenas.find((e) => e.address === address)) return;
      publicClient
        .readContract({
          address: address as `0x${string}`,
          abi: arenaAbi,
          functionName: "getArenaInfosData",
        })
        .then((e) => {
          const [entryCost, participantsNumber, status, winners, games] = e as [
            BigNumber,
            BigNumber,
            number,
            BigNumber[],
            Array<{ id: BigNumber; state: number; winningProno: number }>
          ];
          console.log(Number(utils.formatEther(entryCost)));
          const data: Omit<ArenaType, "address"> = {
            entryCost: Number(utils.formatEther(entryCost)),
            participantsNumber: BigNumber.from(participantsNumber).toNumber(),
            status,
            winners: winners.map((e) => e.toNumber()),
            games: games.map((e) => ({
              id: BigNumber.from(e.id).toNumber(),
              state: e.state,
              winningProno: e.winningProno,
            })),
          };
          setArenas((prev) => [...prev, { address, ...data }]);
        })
        .catch(console.error);
    });
    setLoadings((prev) => ({ ...prev, arenas: false }));
  }, [createdArenasAddresses]);

  return (
    <ArenasContext.Provider
      value={{
        createdArenasAddresses,
        arenaCount,
        arenas,
        loadings,
      }}
    >
      {children}
    </ArenasContext.Provider>
  );
};

export const useArenas = () => {
  const context = useContext(ArenasContext);
  if (!context) {
    throw new Error("useArenas must be used within a ArenasProvider");
  }
  return context;
};
