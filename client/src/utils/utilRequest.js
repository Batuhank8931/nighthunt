import axios from "axios";

export const baseUrl = 'http://192.168.1.5:3050/api/';

async function headers() {
    return {
        "Content-Type": "application/json",
        Accept: "*/*",
        withCredentials: true
    };
}

async function photoheaders() {
    return {
        "Content-Type": "multipart/form-data",
        withCredentials: true
    };
}

async function photoheadersWithToken() {
    const token = localStorage.getItem('token');
    return {
        "Content-Type": "multipart/form-data",
        withCredentials: true,
        Authorization: `Bearer ${token}`,
    };
}

async function headersWithToken() {
    const token = localStorage.getItem('token');
    return {
        "Content-Type": "application/json",
        Accept: "*/*",
        withCredentials: true,
        Authorization: `Bearer ${token}`,
    };
}


const API = {
    login: async (body) => {
        return axios.post(`${baseUrl}login`, body, {
            headers: await headers(),
        });
    },

    loginGamer: async (body) => {
        return axios.post(`${baseUrl}logingamer`, body, {
            headers: await photoheaders(),
        });
    },

    loginMainGamer: async (body) => {
        return axios.post(`${baseUrl}loginmaingamer`, body, {
            headers: await photoheadersWithToken(),
        });
    },

    getloginGamer: async () => {
        return axios.get(`${baseUrl}logingamer`, {
            headers: await headersWithToken(),
        });
    },

    putloginGamer: async (body) => {
        return axios.put(`${baseUrl}logingamer`, body, {
            headers: await photoheadersWithToken(),
        });
    },

    getOldGamer: async (body) => {
        return axios.post(`${baseUrl}getoldgamer`, body, {
            headers: await headers(),
        });
    },

    deleteGamer: async (gamerid) => {
        return axios.delete(`${baseUrl}deletegamer/${gamerid}`, {
            headers: await headersWithToken(),
        });
    },

    createroom: async (body) => {
        return axios.post(`${baseUrl}room`, body, {
            headers: await headersWithToken(),
        });
    },

    getroom: async (userid) => {
        return axios.get(`${baseUrl}room/${userid}`, {
            headers: await headersWithToken(),
        });
    },

    deleteroom: async (roomid) => {
        return axios.delete(`${baseUrl}room/${roomid}`, {
            headers: await headersWithToken(),
        });
    }


};

export default API;
