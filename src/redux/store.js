import { configureStore } from "@reduxjs/toolkit";
import doctorSlice from "./features/doctor/doctorSlice";

export const store = configureStore({
    reducer: {
        doctor: doctorSlice,
    },
});


