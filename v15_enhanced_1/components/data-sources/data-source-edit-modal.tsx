"use client"
import { useState } from "react"
import { Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface DataSource {
  id: number
  name: string
  source_type: string
  host?: string
  port?: number
  database_name?: string
  username?: string
  description?: string
}

interface DataSourceEditModalProps {
  open: boolean
  onClose: () => void
  dataSource: DataSource
  onSuccess?: () => void
}

export function DataSourceEditModal({ open, onClose, dataSource, onSuccess }: DataSourceEditModalProps) {
  const [name, setName] = useState(dataSource.name || "")
  const [isSaving, setIsSaving] = useState(false)

  const save = async () => {
    setIsSaving(true)
    // Replace with real API call
    await new Promise((r) => setTimeout(r, 900))
    setIsSaving(false)
    onSuccess?.()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Edit Data Source: {dataSource.name}
          </DialogTitle>
          <DialogDescription>Update the connection details and settings for your data source.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Label htmlFor="edit-name">Name</Label>
          <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
