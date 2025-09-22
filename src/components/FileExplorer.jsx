import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
  Button,
  Divider
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  AddIcon,
  DeleteIcon,
  EditIcon,
  DownloadIcon,
  AttachmentIcon
} from '@chakra-ui/icons';
import {
  FaFolder,
  FaFolderOpen,
  FaFile,
  FaJs,
  FaPython,
  FaJava,
  FaHtml5,
  FaMarkdown,
  FaFileCode,
  FaFileAlt,
  FaCss3Alt,
  FaUpload
} from 'react-icons/fa';
import { FILE_TYPES, getFileExtension } from '../utils/fileSystem';

const getFileIcon = (filename, isFolder, isOpen) => {
  if (isFolder) {
    return isOpen ? <FaFolderOpen color="#F7B32B" /> : <FaFolder color="#F7B32B" />;
  }

  const extension = getFileExtension(filename);
  const iconProps = { size: 14 };
  
  switch (extension) {
    case 'js':
    case 'jsx':
      return <FaJs color="#F7DF1E" {...iconProps} />;
    case 'ts':
    case 'tsx':
      return <FaFileCode color="#3178C6" {...iconProps} />;
    case 'py':
      return <FaPython color="#3776AB" {...iconProps} />;
    case 'java':
      return <FaJava color="#007396" {...iconProps} />;
    case 'css':
      return <FaCss3Alt color="#1572B6" {...iconProps} />;
    case 'html':
      return <FaHtml5 color="#E34C26" {...iconProps} />;
    case 'md':
      return <FaMarkdown color="#000000" {...iconProps} />;
    default:
      return <FaFile color="#A0A0A0" {...iconProps} />;
  }
};

const FileTreeNode = ({ 
  node, 
  level = 0, 
  onSelect, 
  onToggle, 
  onDelete, 
  onRename,
  onCreateFile,
  onCreateFolder,
  selectedId 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  
  const bgHover = useColorModeValue('gray.100', 'gray.700');
  const bgSelected = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleRename = () => {
    if (editName.trim() && editName !== node.name) {
      onRename(node.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditName(node.name);
      setIsEditing(false);
    }
  };

  return (
    <Box>
      <HStack
        spacing={1}
        px={2}
        py={1}
        pl={`${level * 20 + 8}px`}
        bg={selectedId === node.id ? bgSelected : 'transparent'}
        _hover={{ bg: bgHover }}
        cursor="pointer"
        borderRadius="md"
        onClick={() => node.type === FILE_TYPES.FILE && onSelect(node.id)}
      >
        {node.type === FILE_TYPES.FOLDER && (
          <IconButton
            icon={node.isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            aria-label="Toggle folder"
          />
        )}
        
        <Box ml={node.type === FILE_TYPES.FILE ? 6 : 0}>
          {getFileIcon(node.name, node.type === FILE_TYPES.FOLDER, node.isOpen)}
        </Box>
        
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            size="xs"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Text fontSize="sm" flex={1}>
            {node.name}
          </Text>
        )}
        
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<EditIcon />}
            size="xs"
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
            aria-label="File options"
          />
          <MenuList>
            {node.type === FILE_TYPES.FOLDER && (
              <>
                <MenuItem icon={<AddIcon />} onClick={() => onCreateFile(node.id)}>
                  New File
                </MenuItem>
                <MenuItem icon={<FaFolder />} onClick={() => onCreateFolder(node.id)}>
                  New Folder
                </MenuItem>
                <MenuDivider />
              </>
            )}
            <MenuItem icon={<EditIcon />} onClick={() => setIsEditing(true)}>
              Rename
            </MenuItem>
            <MenuItem icon={<DeleteIcon />} onClick={() => onDelete(node.id)} color="red.500">
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      
      {node.type === FILE_TYPES.FOLDER && node.isOpen && node.children && (
        <VStack align="stretch" spacing={0}>
          {node.children.map(child => (
            <FileTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              onDelete={onDelete}
              onRename={onRename}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              selectedId={selectedId}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export const FileExplorer = ({ 
  fileSystem, 
  onFileSelect, 
  onFileSystemChange,
  selectedFileId 
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [createParentId, setCreateParentId] = useState(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleCreateFile = (parentId = null) => {
    setIsCreating(true);
    setCreateType(FILE_TYPES.FILE);
    setCreateParentId(parentId || fileSystem.root.id);
    setNewItemName('untitled.js');
  };

  const handleCreateFolder = (parentId = null) => {
    setIsCreating(true);
    setCreateType(FILE_TYPES.FOLDER);
    setCreateParentId(parentId || fileSystem.root.id);
    setNewItemName('new-folder');
  };

  const handleCreate = () => {
    if (newItemName.trim()) {
      if (createType === FILE_TYPES.FILE) {
        const file = fileSystem.createFile(createParentId, newItemName.trim());
        onFileSelect(file.id);
      } else {
        fileSystem.createFolder(createParentId, newItemName.trim());
      }
      onFileSystemChange();
      setIsCreating(false);
      setNewItemName('');
    }
  };

  const handleDelete = (nodeId) => {
    fileSystem.deleteNode(nodeId);
    onFileSystemChange();
  };

  const handleRename = (nodeId, newName) => {
    fileSystem.renameNode(nodeId, newName);
    onFileSystemChange();
  };

  const handleToggle = (folderId) => {
    fileSystem.toggleFolder(folderId);
    onFileSystemChange();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(fileSystem.toJSON(), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `project_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // This would need to be handled by parent component
        // to replace the entire fileSystem
        console.log('Import data:', data);
      } catch (error) {
        console.error('Failed to import project:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <HStack p={3} borderBottom="1px" borderColor={borderColor}>
        <Text fontSize="sm" fontWeight="bold" flex={1}>
          EXPLORER
        </Text>
        <Tooltip label="New File">
          <IconButton
            icon={<AddIcon />}
            size="xs"
            variant="ghost"
            onClick={() => handleCreateFile()}
            aria-label="New file"
          />
        </Tooltip>
        <Tooltip label="New Folder">
          <IconButton
            icon={<FaFolder />}
            size="xs"
            variant="ghost"
            onClick={() => handleCreateFolder()}
            aria-label="New folder"
          />
        </Tooltip>
      </HStack>
      
      {isCreating && (
        <HStack p={2} borderBottom="1px" borderColor={borderColor}>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewItemName('');
              }
            }}
            size="sm"
            autoFocus
            placeholder={createType === FILE_TYPES.FILE ? 'filename.js' : 'folder-name'}
          />
          <IconButton
            icon={<AddIcon />}
            size="sm"
            onClick={handleCreate}
            aria-label="Create"
          />
        </HStack>
      )}
      
      <Box flex={1} overflowY="auto" p={2}>
        <VStack align="stretch" spacing={0}>
          {fileSystem.root.children.map(node => (
            <FileTreeNode
              key={node.id}
              node={node}
              onSelect={onFileSelect}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onRename={handleRename}
              onCreateFile={handleCreateFile}
              onCreateFolder={handleCreateFolder}
              selectedId={selectedFileId}
            />
          ))}
        </VStack>
      </Box>
      
      <Divider />
      
      <HStack p={2} spacing={2}>
        <Button
          leftIcon={<DownloadIcon />}
          size="xs"
          variant="outline"
          onClick={handleExport}
          flex={1}
        >
          Export
        </Button>
        <Button
          as="label"
          leftIcon={<FaUpload />}
          size="xs"
          variant="outline"
          flex={1}
          cursor="pointer"
        >
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </Button>
      </HStack>
    </Box>
  );
};