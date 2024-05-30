import { useState } from "react";
import { Box, Button, Text, useToast } from "@chakra-ui/react";
import { executeCode } from "../api";

export const Output = ({ editorRef, language }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      setResult(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box height="100%" display="flex" flexDir="column">
      <Box flex={1}>
        <Text mb={2} fontSize="lg">
          Output
        </Text>
        <Button
          variant="outline"
          colorScheme="green"
          mb={4}
          isLoading={isLoading}
          onClick={runCode}
        >
          Run Code
        </Button>
      </Box>
      <Box
        p={2}
        color={isError ? "red.400" : ""}
        border="1px solid"
        borderRadius={2}
        borderColor={isError ? "red.500" : "#333"}
        flex={5}
      >
        <pre>
          {result
            ? result.map((line, i) => <Text key={i}>{line}</Text>)
            : 'Click "Run Code" to see the output here'}
        </pre>
      </Box>
    </Box>
  );
};
