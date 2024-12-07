import axios from "axios"

const getInstance = () => {
    return axios.create({
        baseURL: "https://bokko.qwerty-almaty.kz/",
        timeout: 100000
    });
}

export default getInstance;