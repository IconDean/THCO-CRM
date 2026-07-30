import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

/**
 * Three-dot context menu for a board (column).
 * Actions: Rename Board, Delete Board.
 */
export default function BoardMenu({ onRename, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Board menu"
          data-testid="board-menu-trigger"
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]/40"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={onRename}
          data-testid="board-menu-rename"
          className="text-sm cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5 mr-2" />
          Rename Board
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          data-testid="board-menu-delete"
          className="text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Delete Board
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
