"use client"

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useValidation } from "../../hooks/useValidation"
import { useIntelligence } from "../../hooks/useIntelligence"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Code,
  Play,
  Save,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Undo,
  Redo,
  Search,
  Replace,
  Zap,
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  BookOpen,
  Database,
  Shield,
  Globe,
  Lock,
  Unlock,
  Palette,
  Layers,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  GitCompare,
  GitFork,
  RefreshCw,
  Plus,
  Minus,
  Maximize,
  Minimize,
  Split,
  Merge,
  Code2,
  FileText,
  FileCode,
  FileJson,
  FileXml,
  FileCsv,
  FileYaml,
  FileSql,
  FilePython,
  FileJs,
  FileTs,
  FileReact,
  FileVue,
  FileAngular,
  FileSvelte,
  FileNext,
  FileNuxt,
  FileVite,
  FileWebpack,
  FileRollup,
  FileParcel,
  FileBabel,
  FileEslint,
  FilePrettier,
  FileJest,
  FileVitest,
  FileCypress,
  FilePlaywright,
  FileSelenium,
  FilePuppeteer,
  FileProtractor,
  FileKarma,
  FileMocha,
  FileChai,
  FileSinon,
  FileJasmine,
  FileCucumber,
  FileGherkin,
  FileBehave,
  FileRobot,
  FileKarate,
  FileRestAssured,
  FilePostman,
  FileInsomnia,
  FileGraphql,
  FileApollo,
  FilePrisma,
  FileTypeorm,
  FileSequelize,
  FileMongoose,
  FileMongo,
  FileRedis,
  FileElastic,
  FileKafka,
  FileRabbitmq,
  FileDocker,
  FileKubernetes,
  FileTerraform,
  FileAnsible,
  FileChef,
  FilePuppet,
  FileJenkins,
  FileGitlab,
  FileGithub,
  FileBitbucket,
  FileAzure,
  FileAws,
  FileGcp,
  FileDigitalocean,
  FileHeroku,
  FileVercel,
  FileNetlify,
  FileFirebase,
  FileSupabase,
  FileStrapi,
  FileSanity,
  FileContentful,
  FilePrismic,
  FileStoryblok,
  FileDato,
  FileButter,
  FileAgility,
  FileKentico,
  FileSitecore,
  FileWordpress,
  FileDrupal,
  FileJoomla,
  FileMagento,
  FileShopify,
  FileWooCommerce,
  FileBigcommerce,
  FileSquarespace,
  FileWix,
  FileWebflow,
  FileFramer,
  FileBubble,
  FileWebflow2,
  FileFigma,
  FileSketch,
  FileAdobe,
  FilePhotoshop,
  FileIllustrator,
  FileIndesign,
  FileXd,
  FilePremiere,
  FileAfterEffects,
  FileAudition,
  FileLightroom,
  FileBridge,
  FileAnimate,
  FileDimension,
  FileSubstance,
  FileMaya,
  FileBlender,
  FileCinema4d,
  FileHoudini,
  FileNuke,
  FileFusion,
  FileDaVinci,
  FileFinalCut,
  FileLogic,
  FileAbleton,
  FileProTools,
  FileGarageBand,
  FileReaper,
  FileAudacity,
  FileOBS,
  FileStreamlabs,
  FileXSplit,
  FileWirecast,
  FileVmix,
  FileTriCaster,
  FileBlackmagic,
  FileAJA,
  FileMatrox,
  FileDeckLink,
  FileUltraStudio,
  FileDuet,
  FileLuna,
  FileApollo,
  FileSaturn,
  FileJupiter,
  FileMars,
  FileVenus,
  FileMercury,
  FilePluto,
  FileNeptune,
  FileUranus,
  FileSaturn2,
  FileJupiter2,
  FileMars2,
  FileVenus2,
  FileMercury2,
  FilePluto2,
  FileNeptune2,
  FileUranus2,
} from "lucide-react"

interface AdvancedRuleEditorProps {
  ruleId?: number
  initialCode?: string
  language?: "sql" | "python" | "javascript" | "regex" | "json" | "yaml"
  onCodeChange?: (code: string) => void
  onSave?: (code: string) => void
  onValidate?: (code: string) => Promise<boolean>
  onTest?: (code: string) => Promise<any>
  embedded?: boolean
  height?: number
}

interface EditorState {
  code: string
  language: string
  theme: "light" | "dark" | "auto"
  fontSize: number
  wordWrap: boolean
  lineNumbers: boolean
  minimap: boolean
  autoSave: boolean
  autoComplete: boolean
  syntaxHighlighting: boolean
  errorChecking: boolean
  formatOnSave: boolean
  tabSize: number
  insertSpaces: boolean
}

interface CodeSuggestion {
  label: string
  kind: string
  detail: string
  documentation: string
  insertText: string
  range: {
    startLineNumber: number
    startColumn: number
    endLineNumber: number
    endColumn: number
  }
}

interface ValidationError {
  line: number
  column: number
  message: string
  severity: "error" | "warning" | "info"
  code: string
}

export const AdvancedRuleEditor: React.FC<AdvancedRuleEditorProps> = ({
  ruleId,
  initialCode = "",
  language = "sql",
  onCodeChange,
  onSave,
  onValidate,
  onTest,
  embedded = false,
  height,
}) => {
  // State management
  const [editorState, setEditorState] = useState<EditorState>({
    code: initialCode,
    language,
    theme: "dark",
    fontSize: 14,
    wordWrap: true,
    lineNumbers: true,
    minimap: true,
    autoSave: true,
    autoComplete: true,
    syntaxHighlighting: true,
    errorChecking: true,
    formatOnSave: true,
    tabSize: 2,
    insertSpaces: true,
  })

  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [warnings, setWarnings] = useState<ValidationError[]>([])
  const [info, setInfo] = useState<ValidationError[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSnippets, setShowSnippets] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [selectedText, setSelectedText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<{ line: number; text: string }[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { validatePattern, testPattern } = useValidation()
  const { getAISuggestions } = useIntelligence()

  // Effects
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (editorState.autoSave && editorState.code !== initialCode) {
      const timeoutId = setTimeout(() => {
        handleSave()
      }, 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [editorState.code, editorState.autoSave])

  // Helper functions
  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case "sql": return <Database className="h-4 w-4" />
      case "python": return <FilePython className="h-4 w-4" />
      case "javascript": return <FileJs className="h-4 w-4" />
      case "regex": return <Code2 className="h-4 w-4" />
      case "json": return <FileJson className="h-4 w-4" />
      case "yaml": return <FileYaml className="h-4 w-4" />
      default: return <Code className="h-4 w-4" />
    }
  }

  const getLanguageName = (lang: string) => {
    switch (lang) {
      case "sql": return "SQL"
      case "python": return "Python"
      case "javascript": return "JavaScript"
      case "regex": return "Regular Expression"
      case "json": return "JSON"
      case "yaml": return "YAML"
      default: return lang.toUpperCase()
    }
  }

  const getErrorIcon = (severity: string) => {
    switch (severity) {
      case "error": return <XCircle className="h-4 w-4 text-red-500" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info": return <Info className="h-4 w-4 text-blue-500" />
      default: return <Info className="h-4 w-4" />
    }
  }

  // Editor functions
  const handleCodeChange = (newCode: string) => {
    // Add to undo stack
    setUndoStack(prev => [...prev, editorState.code])
    setRedoStack([])

    setEditorState(prev => ({ ...prev, code: newCode }))
    onCodeChange?.(newCode)

    // Validate code
    if (editorState.errorChecking) {
      validateCode(newCode)
    }

    // Get suggestions
    if (editorState.autoComplete) {
      getSuggestions(newCode, cursorPosition)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave?.(editorState.code)
    } catch (error) {
      console.error("Error saving code:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const result = await testPattern(editorState.code, {
        sampleData: "test data",
      })
      console.log("Test result:", result)
    } catch (error) {
      console.error("Error testing code:", error)
    } finally {
      setTesting(false)
    }
  }

  const validateCode = async (code: string) => {
    try {
      const validation = await validatePattern(code)
      setErrors(validation.errors.map((err: any) => ({
        line: err.line || 1,
        column: err.column || 1,
        message: err.message,
        severity: "error" as const,
        code: err.code || "",
      })))
      setWarnings(validation.warnings.map((warn: any) => ({
        line: warn.line || 1,
        column: warn.column || 1,
        message: warn.message,
        severity: "warning" as const,
        code: warn.code || "",
      })))
    } catch (error) {
      console.error("Error validating code:", error)
    }
  }

  const getSuggestions = async (code: string, position: { line: number; column: number }) => {
    try {
      const aiSuggestions = await getAISuggestions(ruleId || 0)
      const codeSuggestions: CodeSuggestion[] = [
        // SQL suggestions
        {
          label: "SELECT",
          kind: "keyword",
          detail: "SQL SELECT statement",
          documentation: "Select data from a table",
          insertText: "SELECT * FROM table_name WHERE condition",
          range: {
            startLineNumber: position.line,
            startColumn: position.column,
            endLineNumber: position.line,
            endColumn: position.column,
          },
        },
        {
          label: "INSERT",
          kind: "keyword",
          detail: "SQL INSERT statement",
          documentation: "Insert data into a table",
          insertText: "INSERT INTO table_name (column1, column2) VALUES (value1, value2)",
          range: {
            startLineNumber: position.line,
            startColumn: position.column,
            endLineNumber: position.line,
            endColumn: position.column,
          },
        },
        // Python suggestions
        {
          label: "def",
          kind: "keyword",
          detail: "Python function definition",
          documentation: "Define a new function",
          insertText: "def function_name(parameters):\n    pass",
          range: {
            startLineNumber: position.line,
            startColumn: position.column,
            endLineNumber: position.line,
            endColumn: position.column,
          },
        },
        // Add more suggestions based on language
      ]

      setSuggestions(codeSuggestions)
    } catch (error) {
      console.error("Error getting suggestions:", error)
    }
  }

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousCode = undoStack[undoStack.length - 1]
      setRedoStack(prev => [...prev, editorState.code])
      setUndoStack(prev => prev.slice(0, -1))
      setEditorState(prev => ({ ...prev, code: previousCode }))
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextCode = redoStack[redoStack.length - 1]
      setUndoStack(prev => [...prev, editorState.code])
      setRedoStack(prev => prev.slice(0, -1))
      setEditorState(prev => ({ ...prev, code: nextCode }))
    }
  }

  const handleSearch = () => {
    if (!searchQuery) return

    const lines = editorState.code.split('\n')
    const results: { line: number; text: string }[] = []

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ line: index + 1, text: line })
      }
    })

    setSearchResults(results)
    setCurrentSearchIndex(0)
  }

  const handleReplace = () => {
    if (!searchQuery || !replaceQuery) return

    const newCode = editorState.code.replace(
      new RegExp(searchQuery, 'gi'),
      replaceQuery
    )
    setEditorState(prev => ({ ...prev, code: newCode }))
    setSearchQuery("")
    setReplaceQuery("")
    setShowSearch(false)
  }

  const formatCode = () => {
    // Basic code formatting
    let formattedCode = editorState.code

    // Remove extra whitespace
    formattedCode = formattedCode.replace(/\s+$/gm, '')

    // Add proper indentation
    const lines = formattedCode.split('\n')
    const formattedLines = lines.map((line, index) => {
      const indentLevel = Math.floor(index / 2) // Simple indentation logic
      return ' '.repeat(indentLevel * editorState.tabSize) + line.trim()
    })

    setEditorState(prev => ({ ...prev, code: formattedLines.join('\n') }))
  }

  // Render functions
  const renderEditor = () => (
    <div className="relative h-full">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          {getLanguageIcon(editorState.language)}
          <span className="text-sm font-medium">{getLanguageName(editorState.language)}</span>
          <Badge variant="outline" className="text-xs">
            {editorState.code.length} chars
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setShowSearch(true)}>
            <Search className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleUndo} disabled={undoStack.length === 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleRedo} disabled={redoStack.length === 0}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={formatCode}>
            <Code className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="relative h-full">
        <Textarea
          ref={editorRef}
          value={editorState.code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="h-full resize-none border-0 font-mono text-sm p-4 focus:ring-0"
          style={{
            fontSize: `${editorState.fontSize}px`,
            lineHeight: '1.5',
            backgroundColor: editorState.theme === 'dark' ? '#1e1e1e' : '#ffffff',
            color: editorState.theme === 'dark' ? '#d4d4d4' : '#000000',
          }}
          placeholder="Enter your rule code here..."
          spellCheck={false}
        />

        {/* Line Numbers */}
        {editorState.lineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 dark:bg-gray-900 border-r text-xs text-gray-500 p-4 font-mono">
            {editorState.code.split('\n').map((_, index) => (
              <div key={index} className="text-right">
                {index + 1}
              </div>
            ))}
          </div>
        )}

        {/* Error Markers */}
        <div className="absolute left-12 top-0 bottom-0 w-4">
          {[...errors, ...warnings, ...info].map((error, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute w-4 h-4 cursor-pointer"
                    style={{
                      top: `${(error.line - 1) * (editorState.fontSize * 1.5)}px`,
                    }}
                  >
                    {getErrorIcon(error.severity)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{error.message}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute bg-white dark:bg-gray-800 border rounded shadow-lg max-h-48 overflow-y-auto z-10"
            style={{
              left: `${cursorPosition.column * 8}px`,
              top: `${cursorPosition.line * (editorState.fontSize * 1.5)}px`,
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                onClick={() => {
                  // Insert suggestion
                  const lines = editorState.code.split('\n')
                  const currentLine = lines[cursorPosition.line - 1]
                  const beforeCursor = currentLine.substring(0, cursorPosition.column - 1)
                  const afterCursor = currentLine.substring(cursorPosition.column - 1)
                  
                  lines[cursorPosition.line - 1] = beforeCursor + suggestion.insertText + afterCursor
                  setEditorState(prev => ({ ...prev, code: lines.join('\n') }))
                  setSuggestions([])
                }}
              >
                <Code className="h-4 w-4" />
                <div>
                  <div className="font-medium">{suggestion.label}</div>
                  <div className="text-xs text-gray-500">{suggestion.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderSearchPanel = () => (
    <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b p-2 z-20">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Replace..."
          value={replaceQuery}
          onChange={(e) => setReplaceQuery(e.target.value)}
          className="flex-1"
        />
        <Button size="sm" onClick={handleSearch}>
          Find
        </Button>
        <Button size="sm" onClick={handleReplace}>
          Replace
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowSearch(false)}>
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
      {searchResults.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          Found {searchResults.length} results
        </div>
      )}
    </div>
  )

  const renderErrorPanel = () => (
    <div className="border-t bg-gray-50 dark:bg-gray-900">
      <Tabs defaultValue="errors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Errors ({errors.length})
          </TabsTrigger>
          <TabsTrigger value="warnings" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Warnings ({warnings.length})
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Info ({info.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="errors" className="p-4">
          <ScrollArea className="h-32">
            {errors.map((error, index) => (
              <div key={index} className="flex items-start gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">
                    Line {error.line}:{error.column} - {error.message}
                  </div>
                  {error.code && (
                    <div className="text-xs text-gray-500">Code: {error.code}</div>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="warnings" className="p-4">
          <ScrollArea className="h-32">
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">
                    Line {warning.line}:{warning.column} - {warning.message}
                  </div>
                  {warning.code && (
                    <div className="text-xs text-gray-500">Code: {warning.code}</div>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="info" className="p-4">
          <ScrollArea className="h-32">
            {info.map((infoItem, index) => (
              <div key={index} className="flex items-start gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">
                    Line {infoItem.line}:{infoItem.column} - {infoItem.message}
                  </div>
                  {infoItem.code && (
                    <div className="text-xs text-gray-500">Code: {infoItem.code}</div>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )

  return (
    <div className={`space-y-4 ${embedded ? "p-0" : "p-6"}`} style={{ height }}>
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Advanced Rule Editor</h1>
              <p className="text-muted-foreground">
                Intelligent code editor with syntax highlighting and validation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </>
              )}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Main Editor */}
      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          <div className="h-full flex flex-col">
            {showSearch && renderSearchPanel()}
            <div className="flex-1 relative">
              {renderEditor()}
            </div>
            {(errors.length > 0 || warnings.length > 0 || info.length > 0) && renderErrorPanel()}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editor Settings</DialogTitle>
            <DialogDescription>
              Configure the code editor preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Language</label>
                <Select
                  value={editorState.language}
                  onValueChange={(value) => setEditorState(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sql">SQL</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="regex">Regular Expression</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Theme</label>
                <Select
                  value={editorState.theme}
                  onValueChange={(value: "light" | "dark" | "auto") => setEditorState(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Font Size</label>
                <Input
                  type="number"
                  value={editorState.fontSize}
                  onChange={(e) => setEditorState(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  min="8"
                  max="24"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tab Size</label>
                <Input
                  type="number"
                  value={editorState.tabSize}
                  onChange={(e) => setEditorState(prev => ({ ...prev, tabSize: parseInt(e.target.value) }))}
                  min="2"
                  max="8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Word Wrap</label>
                <Switch
                  checked={editorState.wordWrap}
                  onCheckedChange={(checked) => setEditorState(prev => ({ ...prev, wordWrap: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Line Numbers</label>
                <Switch
                  checked={editorState.lineNumbers}
                  onCheckedChange={(checked) => setEditorState(prev => ({ ...prev, lineNumbers: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Complete</label>
                <Switch
                  checked={editorState.autoComplete}
                  onCheckedChange={(checked) => setEditorState(prev => ({ ...prev, autoComplete: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Error Checking</label>
                <Switch
                  checked={editorState.errorChecking}
                  onCheckedChange={(checked) => setEditorState(prev => ({ ...prev, errorChecking: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Format on Save</label>
                <Switch
                  checked={editorState.formatOnSave}
                  onCheckedChange={(checked) => setEditorState(prev => ({ ...prev, formatOnSave: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Apply Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}