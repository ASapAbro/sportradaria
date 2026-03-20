import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  withCredentials: true, // envoie les cookies dans chaque requête
})

export default instance