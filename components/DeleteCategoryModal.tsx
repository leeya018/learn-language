import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  categoryName: string;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onDelete,
  categoryName,
}: DeleteCategoryModalProps) {
  const [confirmationInput, setConfirmationInput] = useState("");

  const handleDelete = async () => {
    if (confirmationInput === categoryName) {
      const response = await fetch(`/api/categories?name=${categoryName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete();
      } else {
        alert("Failed to delete category");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {categoryName}?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="text"
            placeholder="Type category name to confirm"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={confirmationInput !== categoryName}
            variant="destructive"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
