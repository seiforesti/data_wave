"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tag, Plus, Edit, Trash2, Search, Filter, X } from "lucide-react"

import { DataSource } from "./types"

interface TagsManagerProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface TagItem {
  id: string
  name: string
  description?: string
  color: string
  category: string
  usageCount: number
  createdAt: string
  createdBy: string
}

export function DataSourceTagsManager({
  dataSource,
  onNavigateToComponent,
  className = "" }: TagsManagerProps) {
  const [tags, setTags] = useState<TagItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showCreateTag, setShowCreateTag] = useState(false)
  const [editingTag, setEditingTag] = useState<TagItem | null>(null)
  const [newTag, setNewTag] = useState({ name: "", description: "", color: "#32", category: "General" })

  // Mock data
  const mockTags: TagItem[] = useMemo(() => ([
    {
      id: "1",
      name: "Production",
      description: "Production environment data",
      color: "#ef4444",
      category: "Environment",
      usageCount: 15,
      createdAt: "2024-01-10T10:00:00",
      createdBy: "admin"
    },
    {
      id: "2",
      name: "Sensitive",
      description: "Contains sensitive information",
      color: "#f59e0b",
      category: "Classification",
      usageCount: 8,
      createdAt: "2024-01-14T14:30:00",
      createdBy: "security"
    },
    {
      id: "3",
      name: "Customer Data",
      description: "Customer-related information",
      color: "#10b981",
      category: "DataType",
      usageCount: 12,
      createdAt: "2024-01-09T09:15:00",
      createdBy: "data-team"
    }
  ]), [])

  useEffect(() => {
    setTags(mockTags)
  }, [mockTags])

  const filteredTags = useMemo(() => {
    return tags.filter(tag => {
      const matchesSearch = !searchTerm || 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || tag.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [tags, searchTerm, filterCategory])

  const handleCreateTag = () => {
    if (newTag.name.trim()) {
      const tag: TagItem = {
        id: Date.now().toString(),
        name: newTag.name,
        description: newTag.description,
        color: newTag.color,
        category: newTag.category || "General",
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: "current-user"
      }
      setTags([...tags, tag])
      setNewTag({ name: "", description: "", color: "#32", category: "General" })     setShowCreateTag(false)
    }
  }

  const handleEditTag = () => {
    if (editingTag && editingTag.name.trim()) {
      setTags(tags.map(tag => 
        tag.id === editingTag.id ? { ...editingTag } : tag
      ))
      setEditingTag(null)
    }
  }

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2    <Tag className="h-6 text-blue-600" />
          Tags Manager
          </h2>
          <p className="text-muted-foreground">
            Manage tags and metadata for {dataSource.name}
          </p>
        </div>
        <Button onClick={() => setShowCreateTag(true)}>
          <Plus className="h-4 w-4 mr-2" />          Add Tag
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Organize and categorize your data sources with tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">            <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">           <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="Environment">Environment</option>
                <option value="Classification">Classification</option>
                <option value="Data Type">Data Type</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Tags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map((tag) => (
              <Card key={tag.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div>
                        <h3 className="font-medium">{tag.name}</h3>                   <p className="text-sm text-muted-foreground">{tag.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTag(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{tag.category}</span>
                    <span>{tag.usageCount} uses</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Tag Dialog */}
      <Dialog open={showCreateTag} onOpenChange={setShowCreateTag}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag to organize your data sources
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="Enter tag name"
              />
            </div>
            <div>
              <Label htmlFor="tag-description">Description</Label>
              <Textarea
                id="tag-description"
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                placeholder="Enter tag description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">              <div>
                <Label htmlFor="tag-color">Color</Label>
                <Input
                  id="tag-color"
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tag-category">Category</Label>
                <select
                  id="tag-category"
                  value={newTag.category}
                  onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select category</option>
                  <option value="Environment">Environment</option>
                  <option value="Classification">Classification</option>
                  <option value="Data Type">Data Type</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTag(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag}>
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Modify the selected tag
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-4">              <div>
                <Label htmlFor="edit-tag-name">Tag Name</Label>
                <Input
                  id="edit-tag-name"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-tag-description">Description</Label>
                <Textarea
                  id="edit-tag-description"
                  value={editingTag.description || ""}
                  onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-tag-color">Color</Label>
                  <Input
                    id="edit-tag-color"
                    type="color"
                    value={editingTag.color}
                    onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tag-category">Category</Label>
                  <select
                    id="edit-tag-category"
                    value={editingTag.category}
                    onChange={(e) => setEditingTag({ ...editingTag, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Environment">Environment</option>
                    <option value="Classification">Classification</option>
                    <option value="Data Type">Data Type</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTag(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditTag}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}