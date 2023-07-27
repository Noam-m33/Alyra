import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Grid, GridItem, Stack, Text } from "@chakra-ui/layout";
import { useForm } from "react-hook-form";
import { useContractEvent, useContractWrite } from "wagmi";
import { arenaFactoryAbi } from "../../../utils/abi";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/toast";
import { ethers } from "ethers";
import { Tab, TabList, Tabs } from "@chakra-ui/tabs";
import moment from "moment";
import axios from "axios";
import { FixturesResponseData } from "../../../utils/types";
import { Card } from "@chakra-ui/card";
import { Image } from "@chakra-ui/image";
import { Skeleton } from "@chakra-ui/skeleton";
import { Switch } from "@chakra-ui/switch";

export default function Form() {
  const toast = useToast();
  const { register, handleSubmit } = useForm();
  const [tabIndex, setTabIndex] = useState(0);
  const [fixtureData, setFixtureData] = useState<FixturesResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<number[]>();

  const { write } = useContractWrite({
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: arenaFactoryAbi,
    functionName: "createArena",
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully created the arena",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
  });

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
    const entryCostFormatted = ethers.utils
      .parseEther(data.price.toString())
      .toString();
    console.log(data, "data");
    if (!selectedFixture) {
      toast({
        title: "Error",
        description: "Please select minimum one fixture",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    write({
      args: [
        Number(entryCostFormatted),
        selectedFixture,
        data.isPrivate,
        data.name,
      ],
    });
  };

  const baseUrl = "https://us-central1-poc-royal-freebet.cloudfunctions.net/";

  useEffect(() => {
    setLoading(true);
    const getGames = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}getAllFixturesFromADate?date=${moment()
            .add(tabIndex, "days")
            .format("YYYY-MM-DD")}`
        );
        setFixtureData(res.data.response);
      } catch (error) {
        console.log(error, "error");
      } finally {
        setLoading(false);
      }
    };
    getGames();
  }, [tabIndex]);

  console.log(fixtureData, "fixtureData");

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
          <FormControl
            display={"flex"}
            flexDirection={"column"}
            alignItems={"start"}
          >
            <FormLabel>Private</FormLabel>
            <Switch size={"lg"} {...register("isPrivate")} />
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
              type="text"
              placeholder="Entry Cost"
              {...register("price")}
            />
          </FormControl>
        </Stack>
        <Stack p={3}>
          <Text fontSize={"lg"} fontWeight={"bold"}>
            Select Games
          </Text>
        </Stack>
        <Tabs
          variant="soft-rounded"
          colorScheme="green"
          onChange={(index) => setTabIndex(index)}
        >
          <TabList
            overflowX={"scroll"}
            css={{
              "&::-webkit-scrollbar": {
                width: "40x",
                height: "4px",
              },
              "&::-webkit-scrollbar-track": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                borderRadius: "24px",
                color: "white",
              },
            }}
          >
            {[...new Array(200)].map((_, i) => (
              <Tab key={i}>
                {i === 0 ? "Today" : moment().add(i, "days").format("DD MMM")}
              </Tab>
            ))}
          </TabList>
        </Tabs>
        <Grid
          templateColumns="repeat(2, 1fr)"
          maxHeight={700}
          overflowY={"scroll"}
          gap={5}
        >
          {loading &&
            [...new Array(100)].map((_) => (
              <GridItem w={"100%"}>
                <Card direction={"row"} p={2} gap={5} borderRadius={"md"}>
                  <Skeleton height="20px" />
                  <Skeleton height="20px" />
                  <Skeleton height="20px" />
                </Card>
              </GridItem>
            ))}
          {fixtureData.map((fixture) => {
            return (
              <GridItem
                w={"100%"}
                onClick={() => {
                  if (selectedFixture?.includes(fixture.fixture.id)) {
                    setSelectedFixture((prev) =>
                      prev?.filter((id) => id !== fixture.fixture.id)
                    );
                  } else {
                    setSelectedFixture((prev) => [
                      ...(prev || []),
                      fixture.fixture.id,
                    ]);
                  }
                }}
                cursor={"pointer"}
              >
                <Card
                  direction={"row"}
                  p={2}
                  gap={5}
                  background={
                    selectedFixture?.includes(fixture.fixture.id)
                      ? "green.100"
                      : undefined
                  }
                >
                  <Stack
                    direction={"row"}
                    justifyContent={"center"}
                    width={"100%"}
                  >
                    <Image
                      src={fixture.teams.home.logo}
                      width={5}
                      height={5}
                      aspectRatio={1 / 1}
                      borderRadius={10}
                    />
                    <Text
                      color={
                        selectedFixture?.includes(fixture.fixture.id)
                          ? "green.900"
                          : "white"
                      }
                    >
                      {fixture.teams.home.name} -{" "}
                    </Text>
                    <Image
                      src={fixture.teams.away.logo}
                      width={5}
                      height={5}
                      aspectRatio={1 / 1}
                      borderRadius={10}
                    />
                    <Text
                      color={
                        selectedFixture?.includes(fixture.fixture.id)
                          ? "green.900"
                          : "white"
                      }
                    >
                      {fixture.teams.away.name}
                    </Text>
                  </Stack>
                </Card>
              </GridItem>
            );
          })}
        </Grid>
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
