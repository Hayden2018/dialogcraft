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
        openDeleteMessageModal(modal, { payload }) {
            modal.currentOpen = ModalType.DELETE_MESSAGE;
            modal.payload = payload;
            return modal;
        },
        openEditMessageModal(modal, { payload }) {
            modal.currentOpen = ModalType.EDIT_MESSAGE;
            modal.payload = payload;
            return modal;
        },
        openRestoreMessageModal(modal, { payload }) {
            modal.currentOpen = ModalType.RESTORE_MESSAGE;
            modal.payload = payload;
            return modal;
        },
        openRegenerateMessageModal(modal, { payload }) {
            modal.currentOpen = ModalType.REGENERATE_MESSAGE;
            modal.payload = payload;
            return modal;
        },
    }
})

export default modalSlice.reducer;
export const { 
    closeModal,
    openDeleteChatModal,
    openDeleteMessageModal,
    openEditMessageModal,
    openRestoreMessageModal,
    openRegenerateMessageModal,
} = modalSlice.actions;