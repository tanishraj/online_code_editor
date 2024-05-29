import { useRef, useState } from "react";
import { Box, HStack, useColorMode } from "@chakra-ui/react";
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
    <HStack spacing={4} alignItems="flex-start">
      <Box width="50%">
        <LanguageSelector language={language} onSelect={handleLanguageChange} />
        <Editor
          height="70vh"
          language={language}
          theme={`vs-${colorMode}`}
          defaultValue="// some comment"
          onMount={handleEditorOnMount}
        />
      </Box>
      <Box width="50%">
        <Output editorRef={editorRef} language={language} />
      </Box>
    </HStack>
  );
};
