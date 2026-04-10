import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://botdetection-wdcv.onrender.com"
})

export default API