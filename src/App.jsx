import { Box } from "@chakra-ui/react";
import { ColorModeToggler } from "./components/ThemeToggler";
import { CodeEditor } from "./components/CodeEditor";

function App() {
  return (
    <Box>
      <ColorModeToggler />
      <Box>
        <CodeEditor />
      </Box>
    </Box>
  );
}

export default App;
