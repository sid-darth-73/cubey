import axios from 'axios';

const instance = axios.create({
  baseURL: "https://api-cubey.onrender.com" // "http://localhost:3002"
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
