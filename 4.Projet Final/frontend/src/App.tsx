import { WagmiConfig } from "wagmi";
import "./App.css";
import { Box, ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { config } from "./wagmi.config";
import theme from "./theme";
import { MainLayout } from "./layouts/main";
import ArenaPages from "./components/Arenas";
import { ArenasProvider } from "./context/Arenas";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <WagmiConfig config={config}>
        <ArenasProvider>
          <MainLayout>
            <Box mt={10}>
              <ArenaPages />
            </Box>
          </MainLayout>
        </ArenasProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default App;
