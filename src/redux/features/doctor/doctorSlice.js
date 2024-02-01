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
        doctorsData: null,
        selectedDoctor: null,
        selectedRemarks: null,
        error: null,
        isPhysioSuccess: null,
        removedSlots: [],
        timestamp: [],
        deletedOutput: [],
        isOperationSuccess:null,
        operationArray:[]
    },

    reducers: {

        setResetOperationSuccess(state, action) {
            state.isOperationSuccess = null;
           
        },
        setLogout(state, action) {
            state.userInfo = null;
            state.deletedOutput=[]
            state.removedSlots=[]
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
        // setOperationDataMutate(state, action) {
        //     state.operationArray =  action.payload;
        // },
        setSuccessReset(state, action) {
            state.isPhysioSuccess = null;
        },

        setRemovedSlots(state, action) {
            // Assuming action.payload is the item you want to push into the array
            state.removedSlots = [...state.removedSlots, ...(Array.isArray(action.payload) ? action.payload : [action.payload])];
        },

        convertToDesiredFormat(state, action) {
            const data = state.removedSlots;
            const convertedData = {};

            data.forEach(slot => {
                const key = `${slot.day}-${slot.date}`;

                if (!convertedData[key]) {
                    convertedData[key] = {
                        days: slot.day,
                        dates: slot.date,
                        slots: []
                    };
                }

                const existingSlot = convertedData[key].slots.find(existing => existing.timestamp === slot.timestamp);
                if (!existingSlot) {
                    convertedData[key].slots.push({
                        timestamp: slot.timestamp,
                        assignedDoctor: slot.assignedDoctor,
                        remark: slot.remark,
                        period: slot.period,
                        day: slot.day,
                        date: slot.date
                    });
                }
            });


            // const sortedOutput = Object.values(convertedData).map(entry => ({
            //     ...entry,
            //     slots: entry.slots.slice().sort((a, b) => {
            //         const timeA = new Date(`2000-01-01 ${a.timestamp}`);
            //         const timeB = new Date(`2000-01-01 ${b.timestamp}`);
            //         return timeA - timeB;
            //     })
            // }));
            const sortedOutput = Object.values(convertedData).sort((a, b) => {
                // First, compare based on days
                const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const dayA = daysOrder.indexOf(a.days);
                const dayB = daysOrder.indexOf(b.days);
        
                if (dayA !== dayB) {
                    return dayA - dayB;
                }
        
                // If days are the same, compare based on timestamp
                return a.slots[0].timestamp.localeCompare(b.slots[0].timestamp);
            }).map(entry => ({
                ...entry,
                slots: entry.slots.slice().sort((x, y) => {
                    const timeX = new Date(`2000-01-01 ${x.timestamp}`);
                    const timeY = new Date(`2000-01-01 ${y.timestamp}`);
                    return timeX - timeY;
                })
            }));
            state.deletedOutput = sortedOutput;
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
            .addCase(updateOperationsCalendar.pending, (state) => {
                state.isOperationSuccess = null;
                state.error = null;
            })
            .addCase(updateOperationsCalendar.fulfilled, (state, action) => {
                state.isOperationSuccess = action.payload;
                state.error = null;
            })
            .addCase(updateOperationsCalendar.rejected, (state, action) => {
                state.isOperationSuccess = null;
                state.error = action.payload;
            })
    },
});

export default doctorSlice.reducer;
export const { setRole, setDoctorsAvailable, setLogout, setError, setTimestamp,setResetOperationSuccess, convertToDesiredFormat, setRemovedSlots, setSuccessReset, setSelectedDoctor, setRemarks, setDoctorsAppointment } = doctorSlice.actions;
