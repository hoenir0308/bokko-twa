import axios from "axios"

const getInstance = () => {
    return axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
        timeout: 100000
    });
}

export default getInstance;
