import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

/**
 * Three-dot context menu for a task card.
 * Actions: Edit (open editor modal), Delete.
 * Trigger is hidden until the card is hovered (handled by parent styling).
 */
export default function TaskMenu({ onEdit, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Task menu"
          data-testid="task-menu-trigger"
          // stopPropagation so the click doesn't start a drag / open card
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40 focus-visible:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={onEdit}
          data-testid="task-menu-edit"
          className="text-sm cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          data-testid="task-menu-delete"
          className="text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
