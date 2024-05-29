import { Box, Heading } from "@chakra-ui/react";
import { ColorModeToggler } from "./components/ThemeToggler";
import { CodeEditor } from "./components/CodeEditor";

function App() {
  return (
    <Box>
      <Box
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between"
        background="gray.100"
        mb="8"
      >
        <Heading
          flex={4}
          as="h1"
          size="2xl"
          textAlign="center"
          lineHeight={1.5}
        >
          Online Code Playground
        </Heading>
        <ColorModeToggler flex="1" />
      </Box>

      <Box>
        <CodeEditor />
      </Box>
    </Box>
  );
}

export default App;
