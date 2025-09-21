import { useRef, useState } from "react";
import { Box, HStack, useColorMode, Text, IconButton, Tooltip, ButtonGroup } from "@chakra-ui/react";
import { SettingsIcon, CopyIcon, DownloadIcon } from "@chakra-ui/icons";
import { Output } from "./Output";
import { FileTabs } from "./FileTabs";

export const CodeEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const [fontSize, setFontSize] = useState(14);
  const [minimap, setMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState("on");
  const { colorMode } = useColorMode();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleLanguageChange = (language) => {
    setLanguage(language);
  };

  const editorOptions = {
    minimap: { enabled: minimap },
    fontSize: fontSize,
    wordWrap: wordWrap,
    lineNumbers: "on",
    rulers: [80, 120],
    scrollBeyondLastLine: false,
    renderLineHighlight: "all",
    automaticLayout: true,
    suggestOnTriggerCharacters: true,
    formatOnPaste: true,
    formatOnType: true,
    padding: { top: 10, bottom: 10 },
    smoothScrolling: true,
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: true,
    bracketPairColorization: {
      enabled: true
    },
    folding: true,
    foldingStrategy: "indentation",
    showFoldingControls: "always",
    renderWhitespace: "selection",
    guides: {
      bracketPairs: true,
      indentation: true
    }
  };

  const handleCopyCode = () => {
    const code = editorRef.current?.getValue();
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  const handleDownloadCode = () => {
    const code = editorRef.current?.getValue();
    if (code) {
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code.${language}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const toggleMinimap = () => setMinimap(!minimap);
  const toggleWordWrap = () => setWordWrap(wordWrap === "on" ? "off" : "on");
  const increaseFontSize = () => setFontSize(Math.min(fontSize + 2, 30));
  const decreaseFontSize = () => setFontSize(Math.max(fontSize - 2, 10));

  return (
    <HStack spacing={4} align="stretch">
      <Box flex={1} width="50%" height="80vh" display="flex" flexDir="column">
        <HStack mb={2} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Code Editor
          </Text>
          <ButtonGroup size="sm" variant="outline">
            <Tooltip label="Copy code">
              <IconButton icon={<CopyIcon />} onClick={handleCopyCode} aria-label="Copy code" />
            </Tooltip>
            <Tooltip label="Download code">
              <IconButton icon={<DownloadIcon />} onClick={handleDownloadCode} aria-label="Download code" />
            </Tooltip>
            <Tooltip label="Toggle minimap">
              <IconButton 
                icon={<SettingsIcon />} 
                onClick={toggleMinimap}
                aria-label="Toggle minimap" 
              />
            </Tooltip>
          </ButtonGroup>
        </HStack>
        <Box flex={1} border={"1px solid"} borderRadius={4} overflow="hidden">
          <FileTabs
            editorRef={editorRef}
            monacoRef={monacoRef}
            language={language}
            onLanguageChange={handleLanguageChange}
            editorOptions={editorOptions}
            colorMode={colorMode}
          />
        </Box>
      </Box>
      <Box flex={1} width="50%" height="80vh">
        <Output editorRef={editorRef} language={language} />
      </Box>
    </HStack>
  );
};
