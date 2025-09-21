import { useState } from "react";
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
  HStack,
  Input,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Tooltip,
  Text
} from "@chakra-ui/react";
import { AddIcon, CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS, LANGUAGE_VERSIONS } from "../utils/constants";

const FILE_EXTENSIONS = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  csharp: "cs",
  php: "php"
};

export const FileTabs = ({ 
  editorRef, 
  monacoRef, 
  language, 
  onLanguageChange,
  editorOptions,
  colorMode 
}) => {
  const [files, setFiles] = useState([
    { 
      id: 1, 
      name: "main.js", 
      language: "javascript", 
      content: CODE_SNIPPETS.javascript,
      saved: true
    }
  ]);
  const [activeFileId, setActiveFileId] = useState(1);
  const [nextFileId, setNextFileId] = useState(2);
  const [editingTabId, setEditingTabId] = useState(null);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const tabBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const activeFile = files.find(f => f.id === activeFileId);

  const createNewFile = (lang = "javascript") => {
    const extension = FILE_EXTENSIONS[lang] || "txt";
    const newFile = {
      id: nextFileId,
      name: `untitled${nextFileId}.${extension}`,
      language: lang,
      content: CODE_SNIPPETS[lang] || "// Start coding...",
      saved: true
    };
    setFiles([...files, newFile]);
    setActiveFileId(nextFileId);
    setNextFileId(nextFileId + 1);
    onLanguageChange(lang);
  };

  const closeFile = (fileId, e) => {
    e.stopPropagation();
    if (files.length === 1) return; // Keep at least one file open
    
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    
    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0].id);
      onLanguageChange(newFiles[0].language);
    }
  };

  const updateFileContent = (fileId, content) => {
    setFiles(files.map(f => 
      f.id === fileId 
        ? { ...f, content, saved: false }
        : f
    ));
  };

  const selectFile = (fileId) => {
    setActiveFileId(fileId);
    const file = files.find(f => f.id === fileId);
    if (file) {
      onLanguageChange(file.language);
    }
  };

  const renameFile = (fileId, newName) => {
    if (!newName.trim()) return;
    
    // Update language based on file extension
    const extension = newName.split('.').pop();
    const detectedLang = Object.entries(FILE_EXTENSIONS).find(
      ([_, ext]) => ext === extension
    )?.[0] || activeFile.language;

    setFiles(files.map(f => 
      f.id === fileId 
        ? { ...f, name: newName, language: detectedLang }
        : f
    ));
    setEditingTabId(null);
    
    if (fileId === activeFileId) {
      onLanguageChange(detectedLang);
    }
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();
    
    // Add keyboard shortcuts
    editor.addAction({
      id: "run-code",
      label: "Run Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        document.getElementById("run-button")?.click();
      }
    });

    // Add save shortcut
    editor.addAction({
      id: "save-file",
      label: "Save File",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        setFiles(files.map(f => 
          f.id === activeFileId 
            ? { ...f, saved: true }
            : f
        ));
      }
    });
  };

  return (
    <Box h="100%" display="flex" flexDir="column" bg={bgColor} borderRadius="md">
      <HStack 
        px={2} 
        py={1} 
        borderBottom="1px" 
        borderColor={borderColor}
        bg={tabBgColor}
        justify="space-between"
      >
        <HStack spacing={0} flex={1} overflowX="auto">
          {files.map(file => (
            <HStack
              key={file.id}
              px={3}
              py={1}
              bg={activeFileId === file.id ? bgColor : "transparent"}
              borderBottom={activeFileId === file.id ? "2px solid" : "none"}
              borderColor="blue.500"
              cursor="pointer"
              onClick={() => selectFile(file.id)}
              _hover={{ bg: bgColor }}
              spacing={1}
            >
              {editingTabId === file.id ? (
                <Input
                  size="xs"
                  defaultValue={file.name}
                  onBlur={(e) => renameFile(file.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renameFile(file.id, e.target.value);
                    } else if (e.key === "Escape") {
                      setEditingTabId(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  width="100px"
                />
              ) : (
                <Text
                  fontSize="sm"
                  onDoubleClick={() => setEditingTabId(file.id)}
                >
                  {file.name}
                  {!file.saved && "*"}
                </Text>
              )}
              {files.length > 1 && (
                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  variant="ghost"
                  onClick={(e) => closeFile(file.id, e)}
                  aria-label="Close file"
                />
              )}
            </HStack>
          ))}
        </HStack>
        
        <Menu>
          <Tooltip label="New file">
            <MenuButton
              as={IconButton}
              icon={<AddIcon />}
              size="sm"
              variant="ghost"
              aria-label="New file"
            />
          </Tooltip>
          <MenuList>
            {Object.entries(LANGUAGE_VERSIONS).map(([lang, version]) => (
              <MenuItem key={lang} onClick={() => createNewFile(lang)}>
                <HStack justify="space-between" w="100%">
                  <Text>{lang}</Text>
                  <Text fontSize="xs" color="gray.500">
                    .{FILE_EXTENSIONS[lang]}
                  </Text>
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </HStack>

      <Box flex={1} overflow="hidden">
        {activeFile && (
          <Editor
            key={activeFile.id}
            language={activeFile.language}
            theme={`vs-${colorMode}`}
            value={activeFile.content}
            onChange={(value) => updateFileContent(activeFile.id, value)}
            onMount={handleEditorMount}
            options={editorOptions}
          />
        )}
      </Box>
    </Box>
  );
};