import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// রিকোয়েস্ট পাঠানোর সময় অটোমেটিক টোকেন অ্যাড করার জন্য Interceptor ~
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});


export default API;
