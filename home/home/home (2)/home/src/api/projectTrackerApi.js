import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const getAllProjectEntries = () => axios.get(`${API_BASE_URL}/data`);

export const addProjectEntry = (entryData) => axios.post(`${API_BASE_URL}/data`, entryData);

export const updateProjectEntry = (email, index, updateData) =>
    axios.put(`${API_BASE_URL}/data/${email}/${index}`, updateData);

export const deleteProjectEntry = (email, index) =>
    axios.delete(`${API_BASE_URL}/data/${email}/${index}`);
