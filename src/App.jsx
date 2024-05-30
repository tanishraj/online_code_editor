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
        bg="gray.100"
        _dark={{ bg: "black" }}
        mb="8"
        px={4}
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

      <Box p={4}>
        <CodeEditor />
      </Box>
    </Box>
  );
}

export default App;
