import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@/components/ui/Visually-hidden"

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <VisuallyHidden>Settings</VisuallyHidden>
          </DialogTitle>
          <DialogDescription>
            Manage your account settings
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {/* rest of code here */}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </Dialog>
  )
}

