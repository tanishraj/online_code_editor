import { useState } from "react";
import { Box, Button, Text, useToast, HStack, ButtonGroup, Tooltip, IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { FaPlay, FaStop } from "react-icons/fa";
import { executeCode } from "../api";
import { DevTools } from "./DevTools";

export const Output = ({ editorRef, language }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  const runCode = async () => {
    const sourceCode = editorRef.current?.getValue();
    if (!sourceCode) {
      toast({
        title: "No code to run",
        description: "Please write some code first",
        status: "warning",
        duration: 3000
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const startTime = performance.now();
      
      const { run: result } = await executeCode(language, sourceCode);
      
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      
      if (result.stderr) {
        setError(result.stderr);
        setOutput(result.stdout || "");
      } else {
        setOutput(result.output || result.stdout || "");
        setError(null);
      }
    } catch (error) {
      setError(error.message || "Unable to run code");
      toast({
        title: "Execution failed",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopExecution = () => {
    setIsLoading(false);
    toast({
      title: "Execution stopped",
      status: "info",
      duration: 2000
    });
  };

  const downloadOutput = () => {
    const content = output || error || "No output";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box height="100%" display="flex" flexDir="column">
      <HStack mb={2} justify="space-between">
        <Text fontSize="lg" fontWeight="bold">
          Developer Console
        </Text>
        <ButtonGroup size="sm">
          <Button
            id="run-button"
            leftIcon={isLoading ? <FaStop /> : <FaPlay />}
            colorScheme={isLoading ? "red" : "green"}
            isLoading={isLoading}
            onClick={isLoading ? stopExecution : runCode}
            loadingText="Running..."
          >
            {isLoading ? "Stop" : "Run"}
          </Button>
          <Tooltip label="Download output">
            <IconButton
              icon={<DownloadIcon />}
              variant="outline"
              onClick={downloadOutput}
              aria-label="Download output"
            />
          </Tooltip>
        </ButtonGroup>
      </HStack>
      
      <Box flex={1} minH={0}>
        <DevTools
          output={output}
          error={error}
          isLoading={isLoading}
          executionTime={executionTime}
        />
      </Box>
    </Box>
  );
};
