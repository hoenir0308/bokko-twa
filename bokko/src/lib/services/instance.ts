import axios from "axios"

const getInstance = () => {
    return axios.create({
        baseURL: "https://bokko.grabitkorovany.org/",
        timeout: 100000
    });
}

export default getInstance;