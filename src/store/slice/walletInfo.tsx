import { createSlice,PayloadAction } from "@reduxjs/toolkit";
  
  const initialState = {
    name: "",
    address: "",
    balance: "",
    network: "",
    chainId: "",
    posts:[],
  };

export const walletInfoSlice = createSlice({
  name: "WalletInfo",
  initialState,
  reducers: {
    setWalletInfo(
      state, action
    ) {
      state.address = action.payload.address;
      state.balance =  action.payload.balance;
      state.network = action.payload.network;
      state.chainId =  action.payload.chainId;
    },
    setPostData(state,action){
      console.log("\n\n WalletInfo -::- setPosts");
      const { post } = action.payload;
      // Update state immutably by creating a new object
      return {
        ...state,
        posts: post, // Assuming action.payload.post is the array of posts
      };
    }
  
  },
});

export const { setWalletInfo,setPostData } = walletInfoSlice.actions;

export default walletInfoSlice.reducer;
