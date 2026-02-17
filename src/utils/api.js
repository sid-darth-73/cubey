import axios from 'axios';

const backend_url = import.meta.env.VITE_BACKEND_URL;

const instance = axios.create({
  baseURL:  backend_url || "http://localhost:3002"
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  //console.log(token); // deubg
  if(token) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
