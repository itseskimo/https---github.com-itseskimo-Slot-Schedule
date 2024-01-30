import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';







export const register = createAsyncThunk("register", async (data, { rejectWithValue }) => {

    try {
        const config = { headers: { "Content-Type": "application/json" } };
        const apiUrl = `https://aerflyt.onrender.com/register`;

        const response = await axios.post(apiUrl, data, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        } else {
            return rejectWithValue("An error occurred");
        }
    }
});


export const login = createAsyncThunk("login", async (data, { rejectWithValue }) => {

    try {
        const config = { headers: { "Content-Type": "application/json" } };
        const apiUrl = `https://aerflyt.onrender.com/login`;

        const response = await axios.post(apiUrl, data, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        } else {
            return rejectWithValue("An error occurred");
        }
    }
});


export const addPhysioCalendar = createAsyncThunk("addPhysioCalendar", async (data, { rejectWithValue }) => {

    try {
        const config = { headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${data.token}` } };
        const apiUrl = `https://aerflyt.onrender.com/physio-calendar`;


        const response = await axios.post(apiUrl, data.physioData, config);
        return response;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        } else {
            return rejectWithValue("An error occurred");
        }
    }
});

export const getPhysioCalendar = createAsyncThunk("getPhysioCalendar", async (data, { rejectWithValue }) => {

    try {
        const config = { headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${data.token}` } };
        const apiUrl = `https://aerflyt.onrender.com/get-physio-schedules`;

        const response = await axios.get(apiUrl, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        } else {
            return rejectWithValue("An error occurred");
        }
    }
});

export const getAllDoctors = createAsyncThunk("getAllDoctors", async (_, { rejectWithValue }) => {

    try {
        const config = { headers: { "Content-Type": "application/json" } };
        const apiUrl = `https://aerflyt.onrender.com/get-doctors-info`;

        const response = await axios.get(apiUrl, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        } else {
            return rejectWithValue("An error occurred");
        }
    }
});



export const updateOperationsCalendar = createAsyncThunk("updateOperationsCalendar", async (data, { rejectWithValue }) => {

    try {
        const config = { headers: { "Content-Type": "application/json" } };
        const apiUrl = `https://aerflyt.onrender.com/update-calendars`;


        const response = await axios.post(apiUrl, data, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data);
        } else {
            return rejectWithValue("An error occurred");
        }
    }
});


const doctorSlice = createSlice({
    name: "doctors",

    initialState: {
        userInfo: null,
        role: '',
        physioInfo: null,
        bookedSlots: null,
        doctorsList: null,
        availableDoctors: null,
        doctorsData:null,
        selectedDoctor: null,
        selectedRemarks: null,
        error: null,
        isPhysioSuccess:null,
        removedSlots:[],
        timestamp:[]
    },

    reducers: {

        setLogout(state, action) {
            state.userInfo = null;
        },
        setRole(state, action) {
            state.role = action.payload;
        },
        setSelectedDoctor(state, action) {
            state.selectedDoctor = action.payload;
        },

        setDoctorsAvailable(state, action) {
            state.availableDoctors = action.payload;
        },
        setRemarks(state, action) {
            state.selectedRemarks = action.payload;
        },
        setDoctorsAppointment(state, action) {
            state.doctorsData = action.payload;
        },
        setError(state, action) {
            state.error = null;
        },
        setSuccessReset(state, action) {
            state.isPhysioSuccess = null;
        },
        // setRemovedSlots(state, action) {
        //     state.removedSlots = action.payload;
        // },
        setRemovedSlots(state, action) {
            // Assuming action.payload is the item you want to push into the array
            state.removedSlots = [...state.removedSlots, ...(Array.isArray(action.payload) ? action.payload : [action.payload])];
        },
        
        setTimestamp(state, action) {
            state.timestamp = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.userInfo = null;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.userInfo = action.payload;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.userInfo = null;
                state.error = action.payload;
            })


            .addCase(login.pending, (state) => {
                state.userInfo = null;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.userInfo = action.payload;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.userInfo = null;
                state.error = action.payload;
            })

            .addCase(addPhysioCalendar.pending, (state) => {
                state.isPhysioSuccess = null;
                state.error = null;
            })
            .addCase(addPhysioCalendar.fulfilled, (state, action) => {
                state.isPhysioSuccess = action.payload;
                state.error = null;
            })
            .addCase(addPhysioCalendar.rejected, (state, action) => {
                state.isPhysioSuccess = null;
                state.error = action.payload;
            })


            .addCase(getPhysioCalendar.pending, (state) => {
                state.bookedSlots = null;
                state.error = null;
            })
            .addCase(getPhysioCalendar.fulfilled, (state, action) => {
                state.bookedSlots = action.payload;
                state.error = null;
            })
            .addCase(getPhysioCalendar.rejected, (state, action) => {
                state.bookedSlots = null;
                state.error = action.payload;
            })

            .addCase(getAllDoctors.pending, (state) => {
                state.doctorsList = null;
                state.error = null;
            })
            .addCase(getAllDoctors.fulfilled, (state, action) => {
                state.doctorsList = action.payload;
                state.error = null;
            })
            .addCase(getAllDoctors.rejected, (state, action) => {
                state.doctorsList = null;
                state.error = action.payload;
            })
    },
});

export default doctorSlice.reducer;
export const { setRole, setDoctorsAvailable,setLogout,setError,setTimestamp,setRemovedSlots,setSuccessReset, setSelectedDoctor, setRemarks,setDoctorsAppointment } = doctorSlice.actions;
