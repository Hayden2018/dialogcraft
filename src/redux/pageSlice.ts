import { createSlice } from '@reduxjs/toolkit'
import { PageConfig, PageType } from 'redux/type.d';

const initialState: PageConfig = {
    current: PageType.LOGIN,
    history: [],
};

const pageSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        navigate(page, { payload }) {
            const { to } = payload;
            page.history.push(to);
            page.current = to;
            return page;
        },
        back(page) {
            if (page.history.length > 1) {
                const previousPage = page.history.at(-2);
                page.current = previousPage;
                page.history.pop();
            }
            return page;
        },
    }
})

export default pageSlice.reducer;
export const { navigate, back } = pageSlice.actions;