import { ClientToServer } from "./ClientToServer";
import "./index.css";
import ServerToClient from "./ServerToClient";


export function App() {
  return (
    <div className="app">
      <ClientToServer />
      <ServerToClient />
    </div>
  );
}

export default App;
