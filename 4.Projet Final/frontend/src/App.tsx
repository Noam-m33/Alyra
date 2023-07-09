import { WagmiConfig } from "wagmi";
import "./App.css";
import { config } from "./wagmi.config";
import { Profile } from "./components/Profile";

function App() {
  return (
    <WagmiConfig config={config}>
      <Profile />
    </WagmiConfig>
  );
}

export default App;
