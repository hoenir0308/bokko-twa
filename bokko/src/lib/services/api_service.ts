import { Goal, Task, User } from "../types";
import getInstance from "./instance";

const instance = getInstance();

export interface IEditTask {
    task_id: string;
    updates: Task,
}

export const ApiService = {
    async reg(user: User, auth: string) {
        try {
            return await instance.post(`/user/register/`,
                user, {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data
            })
        } catch (err) {
            throw err
        }
    },
    async me(auth: string): Promise<User> {
        try {
            return await instance.get(`/user/me/`,
                {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data as User
            })
        } catch (err) {
            throw err
        }
    },
    async updateMe(user: User, auth: string) {
        try {
            return await instance.put(`/user/`,
                user, {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data
            })
        } catch (err) {
            throw err
        }
    },
    async createGoal(goal: Goal, auth: string) {
        try {
            return await instance.post(`/goal/`,
                goal, {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data
            })
        } catch (err) {
            throw err
        }
    },
    async getGoals(auth: string): Promise<Goal[]> {
        try {
            return await instance.get(`/goal/`,
                {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data as Goal[]
            })
        } catch (err) {
            throw err
        }
    },
    async getTask(id: string, auth: string): Promise<Task> {
        try {
            return await instance.get(`/task/fromid/?task_id=${id}`,
                {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data as Task
            })
        } catch (err) {
            throw err
        }
    },
    async deleteGoal(goal_id: string, auth: string) {
        try {
            return await instance.delete(`/user/?goal_id=${goal_id}`,
                {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data
            })
        } catch (err) {
            throw err
        }
    },
    async createTask(goal_id: string, task: Task, auth: string) {
        try {
            return await instance.post(`/task/?goal_id=${goal_id}`,
                task, {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data as Task;
            })
        } catch (err) {
            throw err
        }
    },

    async editTask(task_id: string, task: Task, auth: string) {
        try {
            return await instance.put(`/task/?task_id=${task_id}`,
                task, {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data
            })
        } catch (err) {
            throw err
        }
    },
    async editTasks(tasks: IEditTask[], auth: string) {
        try {
            return await instance.patch(`/task/`,
                tasks, {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data["updated_tasks"] as Task[]
            })
        } catch (err) {
            throw err
        }
    },
    async getTasks( auth: string, goal_id?: string | null, date?:string | null) {
        try {
            let url = `/task/`
            if (date)
                url += `?date=${date}`
            if (goal_id)
                url += `?goal_id=${goal_id}`
            return await instance.get(`${url}`,
                {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                const data: Task[] = res.data;
                return data.sort((task1, task2) => task1.index - task2.index);
            })
        } catch (err) {
            throw err
        }
    },
    async deleteTask(task_id: string, auth: string) {
        try {
            return await instance.delete(`/task?task_id=${task_id}`,
                {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data
            })
        } catch (err) {
            throw err
        }
    },
    async confurmTask(task_id: string, state: boolean, auth: string) {
        try {
            return await instance.put(`/task/confurm/?task_id=${task_id}&state=${state}`, {},
                {
                    headers: {
                        Authorization: `twa ${auth}`
                    }
                }
            ). then((res) => {
                return res.data
            })
        } catch (err) {
            throw err
        }
    },
    async askGoal(goal_id: string, auth: string) {
        try {
            return await instance.post(`/ask/decomposing/?goal_id=${goal_id}`, {},
                {
                    headers : {
                        Authorization: `twa ${auth}`
                    }
                }
            ).then((res) => {
                return res.data
            })
        } catch (err) {
            throw err;
        }
    }
}

