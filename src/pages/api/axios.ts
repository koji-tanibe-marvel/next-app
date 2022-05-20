import axios from "axios";

export const Axios = axios.create({
  responseType: "json",
  headers: {
    "Access-Control-Allow-Headers": "Content-Type,content-type",
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,GET,PUT,DELETE,OPTIONS',
    'Content-Type': 'multipart/form-data',
  },
});
