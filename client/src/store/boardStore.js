import { create } from "zustand";
import api from "../services/api";

export const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  tasks: [],
  isLoading: false,
  error: null,

  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/boards");
      set({ boards: data.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      set({
        currentBoard: data.data.board,
        tasks: data.data.tasks,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createBoard: async (boardData) => {
    const { data } = await api.post("/boards", boardData);
    set({ boards: [data.data, ...get().boards] });
    return data.data;
  },

  updateBoard: async (boardId, boardData) => {
    const { data } = await api.put(`/boards/${boardId}`, boardData);
    set({
      boards: get().boards.map((b) =>
        b._id === boardId ? data.data : b
      ),
      currentBoard:
        get().currentBoard?._id === boardId ? data.data : get().currentBoard,
    });
    return data.data;
  },

  deleteBoard: async (boardId) => {
    await api.delete(`/boards/${boardId}`);
    set({ boards: get().boards.filter((b) => b._id !== boardId) });
  },

  addColumn: async (boardId, columnData) => {
    const { data } = await api.post(`/boards/${boardId}/columns`, columnData);
    set({ currentBoard: data.data });
    return data.data;
  },

  updateColumns: async (boardId, columns) => {
    const { data } = await api.put(`/boards/${boardId}/columns`, { columns });
    set({ currentBoard: data.data });
    return data.data;
  },

  deleteColumn: async (boardId, columnId) => {
    const { data } = await api.delete(`/boards/${boardId}/columns/${columnId}`);
    set({
      currentBoard: data.data,
      tasks: get().tasks.filter((t) => t.columnId !== columnId),
    });
  },

  createTask: async (taskData) => {
    const { data } = await api.post("/tasks", taskData);
    set({ tasks: [...get().tasks, data.data] });
    return data.data;
  },

  updateTask: async (taskId, taskData) => {
    const { data } = await api.put(`/tasks/${taskId}`, taskData);
    set({
      tasks: get().tasks.map((t) =>
        t._id === taskId ? data.data : t
      ),
    });
    return data.data;
  },

  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    set({ tasks: get().tasks.filter((t) => t._id !== taskId) });
  },

  moveTask: async (taskId, moveData) => {
    const { data } = await api.put(`/tasks/${taskId}/move`, moveData);
    return data.data;
  },

  setTasks: (tasks) => set({ tasks }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
}));