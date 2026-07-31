/**
 * Task board permission sets. Everything in TaskBoard/BoardColumn/TaskCard
 * reads from a `permissions` object instead of a single `canManage` flag, so
 * a third, in-between mode (a public "Editable" share link — task-level
 * actions only, no board management) can exist alongside the original two
 * (Project Coordinator vs. read-only internal viewer) without forking any
 * rendering or drag-and-drop logic.
 */

export const FULL_PERMISSIONS = {
  manageBoards: true,
  createTasks: true,
  editTasks: true,
  moveTasks: true,
  deleteTasks: true,
  assignTasks: true,
};

export const READ_ONLY_PERMISSIONS = {
  manageBoards: false,
  createTasks: false,
  editTasks: false,
  moveTasks: false,
  deleteTasks: false,
  assignTasks: false,
};

// A public "Editable" share link: task info can be created/edited/moved,
// but boards are structural (coordinator-only) and assignment stays an
// internal concept — neither is ever granted to an external link.
export const SHARED_EDIT_PERMISSIONS = {
  manageBoards: false,
  createTasks: true,
  editTasks: true,
  moveTasks: true,
  deleteTasks: false,
  assignTasks: false,
};

export function permissionsFromCanManage(canManage) {
  return canManage ? FULL_PERMISSIONS : READ_ONLY_PERMISSIONS;
}
