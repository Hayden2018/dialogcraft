import { createSlice } from '@reduxjs/toolkit'
import { ModalConfig } from 'redux/type.d';

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
        openModal(modal, { payload }) {
            const { type, ...rest } = payload;
            modal.currentOpen = type;
            modal.payload = rest;
            return modal;
        },
    }
})

export default modalSlice.reducer;
export const { 
    closeModal,
    openModal,
} = modalSlice.actions;