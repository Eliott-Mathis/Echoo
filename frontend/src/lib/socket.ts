import { io } from "socket.io-client"

async function createSocket() {
  //const token = await getAccessToken();
  return io('http://localhost:3000', {
    withCredentials:true,
  });
}

export default createSocket;
