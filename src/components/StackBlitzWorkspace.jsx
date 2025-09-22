import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  ButtonGroup,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  useColorMode,
  Tooltip,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Flex,
  Spacer,
  Divider,
  Code
} from '@chakra-ui/react';
import { CloseIcon, AddIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  FaPlay,
  FaRedo,
  FaExpand,
  FaCompress,
  FaCode,
  FaDesktop,
  FaBug,
  FaTerminal,
  FaFolder,
  FaFile,
  FaExternalLinkAlt,
  FaCopy,
  FaDownload,
  FaChrome,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaReact,
  FaVuejs,
  FaSave,
  FaShareAlt,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { BiRefresh, BiX } from 'react-icons/bi';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSystem } from '../utils/fileSystem';
import { storage } from '../utils/storage';
import { StackBlitzExplorer } from './StackBlitzExplorer';

const MotionBox = motion(Box);

// Get file icon based on extension
const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    'html': <FaHtml5 color="#E34C26" />,
    'css': <FaCss3Alt color="#1572B6" />,
    'js': <FaJs color="#F7DF1E" />,
    'jsx': <FaReact color="#61DAFB" />,
    'ts': <FaCode color="#3178C6" />,
    'tsx': <FaReact color="#61DAFB" />,
    'vue': <FaVuejs color="#4FC08D" />,
    'json': <FaFile color="#FBC02D" />
  };
  return icons[ext] || <FaFile color="#9CA3AF" />;
};

export const StackBlitzWorkspace = () => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const iframeRef = useRef(null);
  const editorRef = useRef(null);
  const [fileSystem, setFileSystem] = useState(() => {
    const saved = storage.load('fileSystem');
    return saved ? FileSystem.fromJSON(saved) : FileSystem.createDefaultProject();
  });

  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [version, setVersion] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [activeView, setActiveView] = useState('preview'); // 'preview' | 'console'
  const [isLoading, setIsLoading] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Auto-save to localStorage
  useEffect(() => {
    if (fileSystem) {
      storage.save('fileSystem', fileSystem.toJSON());
    }
  }, [fileSystem, version]);

  // Find all relevant files
  const findProjectFiles = useCallback(() => {
    if (!fileSystem?.root) return { html: null, css: [], js: [] };
    
    const files = { html: null, css: [], js: [] };
    const traverse = (node) => {
      if (node.type === 'file') {
        const ext = node.name.split('.').pop().toLowerCase();
        if (ext === 'html' && !files.html) {
          files.html = node;
        } else if (ext === 'css') {
          files.css.push(node);
        } else if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
          files.js.push(node);
        }
      } else if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    fileSystem.root.children.forEach(traverse);
    return files;
  }, [fileSystem]);

  // Create bundled HTML
  const createBundle = useCallback(() => {
    const { html, css, js } = findProjectFiles();
    
    let htmlContent = html?.content || `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StackBlitz Preview</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
      }
      h1 {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 20px;
      }
      .emoji {
        font-size: 60px;
        margin-bottom: 20px;
      }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🚀</div>
        <h1>Welcome to StackBlitz Editor!</h1>
        <p>Create an <strong>index.html</strong> file to start building your app</p>
        <p>Your HTML, CSS, and JavaScript will be automatically bundled!</p>
    </div>
</body>
</html>`;

    // Inject CSS files
    if (css.length > 0) {
      const cssContent = css.map(file => 
        `/* ${file.name} */\n${file.content || ''}`
      ).join('\n\n');
      const styleTag = `<style>\n${cssContent}\n</style>`;
      htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
    }

    // Inject JavaScript with console capture
    const consoleScript = `
<script>
(function() {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };
  
  ['log', 'error', 'warn', 'info'].forEach(method => {
    console[method] = function(...args) {
      originalConsole[method].apply(console, args);
      window.parent.postMessage({
        type: 'console',
        method: method,
        args: args.map(arg => {
          try {
            if (arg === undefined) return 'undefined';
            if (arg === null) return 'null';
            if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
            return String(arg);
          } catch (e) {
            return String(arg);
          }
        }),
        timestamp: new Date().toLocaleTimeString()
      }, '*');
    };
  });
  
  window.addEventListener('error', (e) => {
    window.parent.postMessage({
      type: 'console',
      method: 'error',
      args: [\`Error: \${e.message} at line \${e.lineno}\`],
      timestamp: new Date().toLocaleTimeString()
    }, '*');
    return true;
  });
})();
</script>`;

    if (js.length > 0) {
      const jsContent = js.map(file => {
        const content = file.content || '';
        return `
// ${file.name}
try {
  ${content}
} catch (error) {
  console.error('Error in ${file.name}:', error.toString());
}`;
      }).join('\n\n');

      const scriptTag = `${consoleScript}\n<script>\n${jsContent}\n</script>`;
      htmlContent = htmlContent.replace('</body>', `${scriptTag}\n</body>`);
    } else {
      htmlContent = htmlContent.replace('</body>', `${consoleScript}\n</body>`);
    }

    return htmlContent;
  }, [findProjectFiles]);

  // Update preview
  const updatePreview = useCallback(() => {
    setIsLoading(true);
    setConsoleOutput([]);
    
    try {
      const bundle = createBundle();
      const blob = new Blob([bundle], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIframeKey(prev => prev + 1);
      
      setTimeout(() => setIsLoading(false), 300);
    } catch (error) {
      console.error('Preview error:', error);
      setIsLoading(false);
      toast({
        title: 'Preview Error',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    }
  }, [createBundle, toast]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'console') {
        setConsoleOutput(prev => [...prev, {
          method: event.data.method,
          args: event.data.args,
          timestamp: event.data.timestamp
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update preview when files change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updatePreview();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [fileSystem, version, updatePreview]);

  // File operations
  const handleFileSelect = (fileId) => {
    const file = fileSystem.root.findNode(fileId);
    if (!file || file.type !== 'file') return;

    if (!openFiles.find(f => f.id === fileId)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveFileId(fileId);
  };

  const handleFileClose = (fileId, e) => {
    e?.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    
    if (activeFileId === fileId && newOpenFiles.length > 0) {
      setActiveFileId(newOpenFiles[0].id);
    }
  };

  const handleFileContentChange = (value) => {
    if (activeFileId && fileSystem) {
      fileSystem.updateFileContent(activeFileId, value);
      setVersion(v => v + 1);
    }
  };

  const handleFileSystemChange = () => {
    setVersion(v => v + 1);
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const handleRefresh = () => {
    updatePreview();
    toast({
      title: 'Preview refreshed',
      status: 'success',
      duration: 1000
    });
  };

  const handleOpenInNewTab = () => {
    const bundle = createBundle();
    const newWindow = window.open('', '_blank');
    newWindow.document.write(bundle);
    newWindow.document.close();
  };

  const activeFile = activeFileId ? fileSystem?.root?.findNode(activeFileId) : null;

  const getConsoleIcon = (method) => {
    switch (method) {
      case 'error': return <FaTimes color="#EF4444" />;
      case 'warn': return <FaExclamationTriangle color="#F59E0B" />;
      case 'info': return <FaInfoCircle color="#3B82F6" />;
      default: return <FaCheckCircle color="#10B981" />;
    }
  };

  return (
    <Box h="100vh" display="flex" flexDirection="column" bg={colorMode === 'dark' ? '#0d1117' : '#ffffff'}>
      {/* Header */}
      <HStack
        h="48px"
        px={4}
        borderBottom="1px solid"
        borderColor={colorMode === 'dark' ? '#30363d' : '#d0d7de'}
        bg={colorMode === 'dark' ? '#0d1117' : '#ffffff'}
      >
        <HStack spacing={3}>
          <Box fontSize="20px">⚡</Box>
          <Text fontWeight="bold" fontSize="lg">StackBlitz Editor</Text>
        </HStack>
        
        <Spacer />
        
        <HStack spacing={2}>
          <Button size="sm" leftIcon={<FaShareAlt />} variant="ghost">
            Share
          </Button>
          <Button size="sm" leftIcon={<FaSave />} variant="ghost">
            Save
          </Button>
          <IconButton
            size="sm"
            icon={isFullscreen ? <FaCompress /> : <FaExpand />}
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label="Toggle fullscreen"
          />
        </HStack>
      </HStack>

      {/* Main Content */}
      <Box flex={1} overflow="hidden">
        <Allotment>
          {/* Left: File Explorer */}
          <Allotment.Pane minSize={200} maxSize={400} preferredSize={240}>
            <StackBlitzExplorer
              fileSystem={fileSystem}
              onFileSelect={handleFileSelect}
              onFileSystemChange={handleFileSystemChange}
              selectedFileId={activeFileId}
            />
          </Allotment.Pane>

          {/* Center: Code Editor */}
          <Allotment.Pane>
            <Box h="100%" display="flex" flexDirection="column">
              {/* File Tabs */}
              <HStack
                h="40px"
                px={2}
                overflowX="auto"
                borderBottom="1px solid"
                borderColor={colorMode === 'dark' ? '#30363d' : '#d0d7de'}
                bg={colorMode === 'dark' ? '#0d1117' : '#f6f8fa'}
              >
                {openFiles.map(file => (
                  <HStack
                    key={file.id}
                    px={3}
                    h="100%"
                    bg={activeFileId === file.id ? (colorMode === 'dark' ? '#0d1117' : '#ffffff') : 'transparent'}
                    borderTop={activeFileId === file.id ? '2px solid' : 'none'}
                    borderColor="#0969da"
                    cursor="pointer"
                    onClick={() => setActiveFileId(file.id)}
                  >
                    {getFileIcon(file.name)}
                    <Text fontSize="sm">{file.name}</Text>
                    <IconButton
                      size="xs"
                      icon={<CloseIcon />}
                      variant="ghost"
                      onClick={(e) => handleFileClose(file.id, e)}
                      aria-label="Close file"
                    />
                  </HStack>
                ))}
                {openFiles.length === 0 && (
                  <Text fontSize="sm" color="gray.500" px={3}>
                    No files open
                  </Text>
                )}
              </HStack>

              {/* Monaco Editor */}
              <Box flex={1}>
                {activeFile ? (
                  <Editor
                    theme={colorMode === 'dark' ? 'vs-dark' : 'vs'}
                    language={activeFile.language || 'javascript'}
                    value={activeFile.content || ''}
                    onChange={handleFileContentChange}
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on'
                    }}
                  />
                ) : (
                  <Flex h="100%" align="center" justify="center">
                    <VStack spacing={4}>
                      <FaCode size={48} color="#9CA3AF" />
                      <Text color="gray.500">Select a file to edit</Text>
                    </VStack>
                  </Flex>
                )}
              </Box>
            </Box>
          </Allotment.Pane>

          {/* Right: Preview & Console */}
          <Allotment.Pane>
            <Box h="100%" display="flex" flexDirection="column">
              {/* Preview Header */}
              <HStack
                h="40px"
                px={4}
                borderBottom="1px solid"
                borderColor={colorMode === 'dark' ? '#30363d' : '#d0d7de'}
                bg={colorMode === 'dark' ? '#0d1117' : '#f6f8fa'}
              >
                <ButtonGroup size="sm" isAttached variant="outline">
                  <Button
                    leftIcon={<FaDesktop />}
                    onClick={() => setActiveView('preview')}
                    bg={activeView === 'preview' ? (colorMode === 'dark' ? '#1f6feb' : '#0969da') : 'transparent'}
                    color={activeView === 'preview' ? 'white' : 'current'}
                  >
                    Preview
                  </Button>
                  <Button
                    leftIcon={<FaBug />}
                    onClick={() => setActiveView('console')}
                    bg={activeView === 'console' ? (colorMode === 'dark' ? '#1f6feb' : '#0969da') : 'transparent'}
                    color={activeView === 'console' ? 'white' : 'current'}
                    position="relative"
                  >
                    Console
                    {consoleOutput.length > 0 && (
                      <Badge
                        position="absolute"
                        top="-1"
                        right="-1"
                        colorScheme="red"
                        borderRadius="full"
                        fontSize="10px"
                      >
                        {consoleOutput.length}
                      </Badge>
                    )}
                  </Button>
                </ButtonGroup>

                <Spacer />

                <HStack spacing={2}>
                  <IconButton
                    size="sm"
                    icon={<BiRefresh />}
                    onClick={handleRefresh}
                    aria-label="Refresh"
                    variant="ghost"
                  />
                  <IconButton
                    size="sm"
                    icon={<FaExternalLinkAlt />}
                    onClick={handleOpenInNewTab}
                    aria-label="Open in new tab"
                    variant="ghost"
                  />
                </HStack>
              </HStack>

              {/* Content Area */}
              <Box flex={1} overflow="hidden" position="relative">
                {activeView === 'preview' ? (
                  <Box w="100%" h="100%" bg="white">
                    {isLoading && (
                      <Flex
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="rgba(255,255,255,0.8)"
                        align="center"
                        justify="center"
                        zIndex={10}
                      >
                        <VStack>
                          <Box className="spinner" />
                          <Text>Loading preview...</Text>
                        </VStack>
                      </Flex>
                    )}
                    <iframe
                      key={iframeKey}
                      ref={iframeRef}
                      src={previewUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        background: 'white'
                      }}
                      sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
                      title="Preview"
                    />
                  </Box>
                ) : (
                  <Box h="100%" overflow="auto" bg={colorMode === 'dark' ? '#0d1117' : '#f6f8fa'} p={4}>
                    <HStack mb={4} justify="space-between">
                      <Text fontWeight="bold">Developer Console</Text>
                      <Button size="xs" leftIcon={<FaTrash />} onClick={clearConsole}>
                        Clear
                      </Button>
                    </HStack>
                    
                    {consoleOutput.length === 0 ? (
                      <Flex h="200px" align="center" justify="center">
                        <VStack spacing={2} opacity={0.5}>
                          <FaTerminal size={32} />
                          <Text fontSize="sm">Console output will appear here</Text>
                        </VStack>
                      </Flex>
                    ) : (
                      <VStack align="stretch" spacing={2}>
                        {consoleOutput.map((log, index) => (
                          <HStack
                            key={index}
                            p={2}
                            bg={colorMode === 'dark' ? '#161b22' : 'white'}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={colorMode === 'dark' ? '#30363d' : '#d0d7de'}
                            align="flex-start"
                            spacing={3}
                          >
                            {getConsoleIcon(log.method)}
                            <Box flex={1}>
                              <Code
                                fontSize="xs"
                                bg="transparent"
                                color={
                                  log.method === 'error' ? 'red.500' :
                                  log.method === 'warn' ? 'yellow.600' :
                                  'current'
                                }
                              >
                                {log.args.join(' ')}
                              </Code>
                            </Box>
                            <Text fontSize="xs" color="gray.500">
                              {log.timestamp}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Box>
    </Box>
  );
};