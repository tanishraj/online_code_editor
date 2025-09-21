import { useState, useEffect, useRef } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  HStack,
  IconButton,
  Badge,
  VStack,
  Tooltip,
  useColorModeValue,
  Divider,
  Code,
  Flex,
  Button
} from "@chakra-ui/react";
import {
  DeleteIcon,
  CopyIcon,
  TimeIcon,
  WarningIcon,
  InfoIcon,
  CheckCircleIcon,
  CloseIcon
} from "@chakra-ui/icons";

export const DevTools = ({ output, isLoading, executionTime, error }) => {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState({
    executionTime: 0,
    memoryUsed: "N/A",
    statusCode: null
  });
  const consoleRef = useRef(null);
  
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const logBgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    if (output) {
      const parsedLogs = parseOutput(output);
      setLogs(parsedLogs);
      
      if (executionTime) {
        setMetrics(prev => ({ ...prev, executionTime }));
      }
    }
  }, [output, executionTime]);

  useEffect(() => {
    if (error) {
      setLogs(prev => [...prev, {
        type: "error",
        message: error,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, [error]);

  const parseOutput = (output) => {
    const lines = output.split("\n");
    return lines.map((line, index) => {
      let type = "log";
      let message = line;
      
      // Detect log types based on content
      if (line.toLowerCase().includes("error")) {
        type = "error";
      } else if (line.toLowerCase().includes("warning")) {
        type = "warn";
      } else if (line.toLowerCase().includes("info")) {
        type = "info";
      }
      
      return {
        id: index,
        type,
        message,
        timestamp: new Date().toLocaleTimeString()
      };
    }).filter(log => log.message.trim() !== "");
  };

  const clearConsole = () => {
    setLogs([]);
  };

  const copyOutput = () => {
    const text = logs.map(log => log.message).join("\n");
    navigator.clipboard.writeText(text);
  };

  const getLogIcon = (type) => {
    switch (type) {
      case "error":
        return <CloseIcon color="red.500" w={3} h={3} />;
      case "warn":
        return <WarningIcon color="yellow.500" w={3} h={3} />;
      case "info":
        return <InfoIcon color="blue.500" w={3} h={3} />;
      default:
        return <CheckCircleIcon color="green.500" w={3} h={3} />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case "error":
        return "red.600";
      case "warn":
        return "yellow.600";
      case "info":
        return "blue.600";
      default:
        return useColorModeValue("gray.700", "gray.300");
    }
  };

  return (
    <Box h="100%" display="flex" flexDir="column" bg={bgColor} borderRadius="md" border="1px" borderColor={borderColor}>
      <Tabs index={activeTab} onChange={setActiveTab} size="sm" variant="enclosed" flex={1} display="flex" flexDir="column">
        <TabList bg={useColorModeValue("gray.100", "gray.800")} borderBottom="1px" borderColor={borderColor}>
          <Tab>
            Console 
            {logs.length > 0 && (
              <Badge ml={2} colorScheme="green" variant="subtle">
                {logs.length}
              </Badge>
            )}
          </Tab>
          <Tab>Metrics</Tab>
          <Tab>Network</Tab>
          <Flex flex={1} justify="flex-end" align="center" pr={2}>
            <HStack spacing={1}>
              <Tooltip label="Clear console">
                <IconButton
                  icon={<DeleteIcon />}
                  size="xs"
                  variant="ghost"
                  onClick={clearConsole}
                  aria-label="Clear console"
                />
              </Tooltip>
              <Tooltip label="Copy output">
                <IconButton
                  icon={<CopyIcon />}
                  size="xs"
                  variant="ghost"
                  onClick={copyOutput}
                  aria-label="Copy output"
                />
              </Tooltip>
            </HStack>
          </Flex>
        </TabList>

        <TabPanels flex={1} overflow="auto">
          <TabPanel p={0} h="100%">
            <VStack
              align="stretch"
              spacing={0}
              h="100%"
              overflow="auto"
              ref={consoleRef}
            >
              {logs.length === 0 ? (
                <Box p={4} color="gray.500" textAlign="center">
                  <Text>Console output will appear here...</Text>
                  <Text fontSize="sm" mt={2}>Press Cmd/Ctrl + Enter to run code</Text>
                </Box>
              ) : (
                logs.map((log) => (
                  <Box
                    key={log.id}
                    px={3}
                    py={2}
                    bg={logBgColor}
                    borderBottom="1px"
                    borderColor={borderColor}
                    _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                  >
                    <HStack spacing={2} align="center">
                      <Box display="flex" alignItems="center" minW="16px">
                        {getLogIcon(log.type)}
                      </Box>
                      <Box flex={1}>
                        <Code
                          fontSize="sm"
                          color={getLogColor(log.type)}
                          bg="transparent"
                          p={0}
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                        >
                          {log.message}
                        </Code>
                      </Box>
                      <Text fontSize="xs" color="gray.500" minW="60px">
                        {log.timestamp}
                      </Text>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack align="stretch" spacing={3} p={3}>
              <HStack justify="space-between">
                <HStack>
                  <TimeIcon />
                  <Text fontWeight="medium">Execution Time</Text>
                </HStack>
                <Badge colorScheme="blue" variant="subtle" fontSize="sm">
                  {metrics.executionTime || "0"}ms
                </Badge>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between">
                <HStack>
                  <InfoIcon />
                  <Text fontWeight="medium">Memory Usage</Text>
                </HStack>
                <Badge colorScheme="purple" variant="subtle" fontSize="sm">
                  {metrics.memoryUsed}
                </Badge>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between">
                <HStack>
                  <CheckCircleIcon />
                  <Text fontWeight="medium">Status</Text>
                </HStack>
                <Badge 
                  colorScheme={error ? "red" : "green"} 
                  variant="subtle" 
                  fontSize="sm"
                >
                  {error ? "Failed" : "Success"}
                </Badge>
              </HStack>
              
              {isLoading && (
                <>
                  <Divider />
                  <Text fontSize="sm" color="blue.500">
                    Executing code...
                  </Text>
                </>
              )}
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack align="stretch" spacing={2} p={3}>
              <Text fontSize="sm" color="gray.500">
                Network activity will be displayed here when API calls are made
              </Text>
              <Box p={3} bg={logBgColor} borderRadius="md" border="1px" borderColor={borderColor}>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">POST /execute</Text>
                  <Badge colorScheme="green" variant="subtle">200 OK</Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  https://emkc.org/api/v2/piston/execute
                </Text>
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};