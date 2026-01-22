import { create } from "zustand";

type User = {
  username: string;
  profilePicture: string;
};

type CallState = {
  users: User[];        
  activeUsers: User[];   
  isCalling: boolean;
  
  setUsers: (users: User[]) => void;           
  addActiveUser: (username: string) => void;   
  removeActiveUser: (username: string) => void; 
  startCall: (users: User[]) => void;         
  endCall: () => void;                     
};

export const useCallStore = create<CallState>((set) => ({
  users: [],
  activeUsers: [],
  isCalling: false,
  
  setUsers: (users) => set({ users }),
  
  addActiveUser: (username) =>
    set((state) => {
      const user = state.users.find(u => u.username === username);
      if (!user) return {}; 
      if (state.activeUsers.some(u => u.username === username)) return {}; 
      return { activeUsers: [...state.activeUsers, user] };
    }),
  
  removeActiveUser: (username) =>
    set((state) => ({
      activeUsers: state.activeUsers.filter(u => u.username !== username)
    })),
  
  startCall: (users) =>
    set({ isCalling: true, users, activeUsers: [] }),
  
  endCall: () =>
    set({ isCalling: false, users: [], activeUsers: [] }),
}));
