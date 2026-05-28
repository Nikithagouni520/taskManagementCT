import api from "../services/api";

export const getTasks = async () => {
  const res = await api.get("/tasks");
  return res.data;
};

export const getBoardTasks = async (boardId) => {
  const res = await api.get(`/tasks/board/${boardId}`);
  return res.data;
};

export const createTask = async (taskData) => {
  const res = await api.post("/tasks", taskData);
  return res.data;
};