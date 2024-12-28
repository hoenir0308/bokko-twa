export interface ApiResponse {
    detail: string;
}

export interface User {
    _id?: string;
    first_name: string;
    last_name: string;
    post: string;
    gender: string;
    age: number | null;
    tg_id?: number;
}

export interface Goal {
    _id?: string;
    title: string;
    description: string;
    deadline: Date;
    tg_id?: number;
    complete?: number;
}

export interface Task {
    _id?: string;
    title: string;
    description: string;
    complite: boolean;
    deadline: Date;
    goal_id?: string;
    end_date?: Date;
    create_date?: Date;
}
