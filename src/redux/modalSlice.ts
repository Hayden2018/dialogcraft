import { createSlice } from '@reduxjs/toolkit'
import { ModalConfig, ModalType } from 'redux/type.d';

const initialState: ModalConfig = {
    currentOpen: null,
    payload: { },
};

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        closeModal(modal) {
            modal.currentOpen = null;
            modal.payload = { };
            return modal;
        },
        openDeleteChatModal(modal, { payload: chatId }) {
            modal.currentOpen = ModalType.DELETE_CHAT;
            modal.payload.chatId = chatId;
            return modal;
        },
    }
})

export default modalSlice.reducer;
export const { 
    closeModal,
    openDeleteChatModal,
} = modalSlice.actions;