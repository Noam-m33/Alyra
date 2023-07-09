import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Stack, Text } from "@chakra-ui/layout";
import MetamaskImage from "../assets/metamask.png";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { Card } from "@chakra-ui/card";

export function Profile() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <Stack>
        <Card p={2.5}>
          <Stack direction={"row"} alignItems={"center"}>
            <Image height={7} width={7} src={MetamaskImage} />
            <Text fontWeight={"semibold"} fontSize={"md"}>
              Connected with {address?.slice(0, 6)}...{address?.slice(-4)}{" "}
            </Text>
            <Button size={"sm"} onClick={() => disconnect()}>
              Disconnect
            </Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack>
      {connectors.map((connector) => (
        <Button
          p={6}
          gap={3}
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          <Image height={7} width={7} src={MetamaskImage} />
          Connect with {connector.name}
          {!connector.ready && " (unsupported)"}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            " (connecting)"}
        </Button>
      ))}

      {error && <div>{error.message}</div>}
    </Stack>
  );
}
