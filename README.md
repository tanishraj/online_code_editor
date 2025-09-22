# CodeCraft Pro - Online Code Editor

A modern, feature-rich online code editor built with React, Chakra UI, and Monaco Editor. Write, edit, and preview code directly in your browser with a VS Code-like experience.

## 🚀 Live Demo

Visit the live application: [CodeCraft Pro](https://my-js-editor.vercel.app/)

## ✨ Features

### Core Features
- **Monaco Editor Integration**: Full-featured code editor with IntelliSense, syntax highlighting, and auto-completion
- **Multi-File Support**: Create and manage multiple files and folders in a project structure
- **File Explorer**: VS Code-style file tree with drag-and-drop support
- **Tab Management**: Work with multiple files simultaneously using tabs
- **Auto-Save**: Automatic saving of files and project state to local storage
- **Theme Support**: Light and dark mode themes

### Code Execution
- **Real-Time Preview**: Live HTML/CSS/JS preview in an isolated iframe
- **Console Output**: Integrated console for viewing JavaScript logs and errors
- **Developer Tools**: Built-in developer tools with console, output, and terminal views
- **Rocket Mode**: Turbo execution mode for faster code processing

### File Management
- **Project Templates**: Pre-built HTML and JavaScript project templates
- **Import/Export**: Import existing projects or export your work
- **File Operations**: Create, rename, delete files and folders
- **Smart Language Detection**: Automatic programming language detection based on file extension

### Preview Modes
- **Developer Tools Mode**: Bundle and preview code locally using blob URLs
- **Console/Preview Toggle**: Switch between console output and live preview
- **Responsive Preview**: Test your web apps in different device sizes
- **Fullscreen Mode**: Distraction-free coding experience

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **UI Library**: Chakra UI v2
- **Code Editor**: Monaco Editor (VS Code's editor)
- **Icons**: React Icons
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Package Manager**: Yarn
- **State Management**: React Hooks
- **File System**: Custom virtual file system implementation

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/tanishraj/online_code_editor.git
cd online_code_editor
```

2. Install dependencies using Yarn:
```bash
yarn install
```

3. Start the development server:
```bash
yarn dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## 📝 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## 🎨 Project Structure

```
online_code_editor/
├── src/
│   ├── api/              # API integration
│   ├── components/       # React components
│   │   ├── ModernOutput.jsx       # Console and output panel
│   │   ├── PreviewMode.jsx        # Live preview component
│   │   ├── ProjectEditor.jsx      # Main editor component
│   │   └── StackBlitzExplorer.jsx # File explorer
│   ├── hooks/           # Custom React hooks
│   ├── styles/          # CSS and styling
│   ├── theme/           # Chakra UI theme configuration
│   ├── utils/           # Utility functions
│   │   ├── fileSystem.js  # Virtual file system
│   │   └── storage.js     # Local storage management
│   ├── App.jsx          # Main app component
│   └── main.jsx         # App entry point
├── public/              # Static assets
├── package.json         # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url_here
```

### VS Code Integration
For the best development experience, install these VS Code extensions:
- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets

## 🎯 Usage

### Creating a New Project
1. Click on the file explorer
2. Right-click to create new files/folders
3. Start coding in the editor

### Loading Templates
- Click "HTML Template" for a basic HTML/CSS/JS project
- Click "JavaScript" for JavaScript snippets

### Running Code
- Click "Run Code" to execute JavaScript
- Use "Preview" mode for HTML/CSS/JS projects
- Toggle between Console and Preview views

### Keyboard Shortcuts
- `Ctrl/Cmd + S` - Save file (auto-save is enabled)
- `Ctrl/Cmd + Enter` - Run code
- `Ctrl/Cmd + /` - Toggle comment
- `Ctrl/Cmd + F` - Find
- `Ctrl/Cmd + H` - Replace

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

- Large bundle size (739KB) - consider implementing code splitting
- Preview mode requires HTML files in the project

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tanish Raj**
- GitHub: [@tanishraj](https://github.com/tanishraj)

## 🙏 Acknowledgments

- Monaco Editor team for the amazing code editor
- Chakra UI team for the beautiful component library
- React team for the powerful framework
- All contributors and users of this project

## 📊 Project Status

- ✅ Core editor functionality
- ✅ File management system
- ✅ Live preview
- ✅ Console integration
- ✅ Theme support
- ✅ Auto-save
- 🔄 Code execution API integration (in progress)
- 📋 Collaborative editing (planned)
- 📋 Cloud storage (planned)

---

Made with ❤️ by Tanish Raj