import { useRef, useState } from "react";
import { Box, HStack, useColorMode, Text } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { LanguageSelector } from "./LanguageSelector";
import { Output } from "./Output";

export const CodeEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const { colorMode } = useColorMode();
  const editorRef = useRef(null);

  const handleLanguageChange = (language) => {
    setLanguage(language);
  };

  const handleEditorOnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <HStack spacing={4}>
      <Box flex={1} width="50%" height="80vh" display="flex" flexDir="column">
        <Box flex={1}>
          <Text mb={2} fontSize="lg">
            Select Language
          </Text>
          <LanguageSelector
            language={language}
            onSelect={handleLanguageChange}
          />
        </Box>
        <Box flex={5} border={"1px solid"} borderRadius={2}>
          <Editor
            language={language}
            theme={`vs-${colorMode}`}
            defaultValue="// some comment"
            onMount={handleEditorOnMount}
          />
        </Box>
      </Box>
      <Box flex={1} width="50%" height="80vh">
        <Output editorRef={editorRef} language={language} />
      </Box>
    </HStack>
  );
};
