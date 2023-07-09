import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Stack } from "@chakra-ui/layout";
import { useForm } from "react-hook-form";
import {
  useChainId,
  useContractEvent,
  useContractWrite,
  useTransaction,
} from "wagmi";
import { arenaFactoryAbi } from "../../../utils/abi";
import { useState } from "react";

export default function Form() {
  const [transaction, setTransaction] = useState<any>(null); // [1
  const { register, handleSubmit } = useForm();
  const { data, write } = useContractWrite({
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: arenaFactoryAbi,
    functionName: "createArena",
    onSuccess: (data: any) => {
      console.log(data, "success");
      setTransaction(data.hash);
    },
    onError: (error: any) => {
      console.log(error, "error");
    },
  });

  const { data: dat2 } = useTransaction({
    hash: transaction,
  }); // [2]

  useContractEvent({
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: arenaFactoryAbi,
    eventName: "ArenaCreated",
    chainId: 31337,
    listener: (log) => {
      console.log(log, "hi frim event");
    },
  });

  const onSubmit = (data: any) => {
    console.log(parseInt(data.price));
    write({
      args: [parseInt(data.price), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={3}>
        <Stack direction={"row"} gap={5}>
          <FormControl>
            <FormLabel>Name of the arena</FormLabel>
            <Input
              type="text"
              placeholder="Name of the arena"
              required
              {...register("name")}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Max number of participants</FormLabel>
            <Input
              type="number"
              placeholder="Max number of participants"
              {...register("maxParticipants")}
            />
          </FormControl>
        </Stack>
        <Stack direction={"row"} gap={5}>
          <FormControl isDisabled>
            <FormLabel>Currency</FormLabel>
            <Input type="text" placeholder="Currency" value={"ETH"} />
          </FormControl>
          <FormControl>
            <FormLabel>Entry Cost 💰</FormLabel>
            <Input
              type="number"
              placeholder="Entry Cost"
              {...register("price")}
            />
          </FormControl>
        </Stack>
        <Button
          mt={5}
          p={5}
          alignSelf={"end"}
          colorScheme="whatsapp"
          type="submit"
        >
          Create this arena
        </Button>
      </Stack>
    </form>
  );
}
