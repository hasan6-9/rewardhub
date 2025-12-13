import api from "./api";

/**
 * Student Achievement Service
 * Endpoints: 24-28
 */

// POST /api/student-achievements
export const awardAchievement = async (data) => {
  const response = await api.post("/student-achievements", data);
  return response.data;
};

// GET /api/student-achievements
export const getStudentAchievements = async (params = {}) => {
  const response = await api.get("/student-achievements", { params });
  return response.data;
};

// GET /api/student-achievements/me (current user's achievements)
export const getMyAchievements = async () => {
  const response = await api.get("/student-achievements/me");
  return response.data;
};

// GET /api/student-achievements/:id
export const getStudentAchievementById = async (id) => {
  const response = await api.get(`/student-achievements/${id}`);
  return response.data;
};

// GET /api/student-achievements/student/:studentId
export const getStudentAchievementsByStudentId = async (studentId) => {
  const response = await api.get(`/student-achievements/student/${studentId}`);
  return response.data;
};

// DELETE /api/student-achievements/:id
export const deleteStudentAchievement = async (id) => {
  const response = await api.delete(`/student-achievements/${id}`);
  return response.data;
};
