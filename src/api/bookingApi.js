import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchBookings = async () => {
  const res = await axios.get(`${API_URL}/booking`);
  return res.data;
};

export const fetchUser = async (userId) => {
  const res = await axios.get(`${API_URL}/user/${userId}`);
  return res.data;
};
