import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllDoctors, setDoctorsAvailable, setSelectedDoctor, updateOperationsCalendar, setLogout } from '../../../redux/features/doctor/doctorSlice';
import { useSelector, useDispatch } from 'react-redux';

const OperationsTable = () => {

    const dispatch = useDispatch();
    const { doctorsList, doctorsData, availableDoctors, selectedDoctor, selectedRemarks } = useSelector((state) => state.doctor);
    const [clientId, setClientId] = useState('');
    const [operationSlots, setOperationSlots] = useState([]);
    const navigate = useNavigate();
    const [calendar, setCalendar] = useState([]);







    function mergeUserData(usersData) {
        const mergedData = [];

        usersData?.forEach((user) => {
            user?.calendars?.forEach((calendar) => {
                calendar?.selectedSlots?.forEach((slot) => {
                    const existingEntry = mergedData?.find(
                        (entry) => entry.day === calendar.day && entry.date === calendar.date && entry.timestamp === slot.timestamp
                    );

                    const userEntry = {
                        userId: user.name,
                        assignedDoctor: slot.assignedDoctor,
                        remarks: slot.remarks,
                        period: slot.period,
                    };

                    // Check if slot.users exists and is an array
                    if (slot.users && Array.isArray(slot.users)) {
                        // Append remarks from slot.users to userEntry
                        userEntry.remarks = slot.users.map((user) => user.remarks).join(', ')
                    }

                    if (existingEntry) {
                        // Entry already exists, append user data
                        existingEntry.users.push(userEntry);
                    } else {
                        // Entry doesn't exist, create a new entry
                        mergedData.push({
                            day: calendar.day,
                            date: calendar.date,
                            timestamp: slot.timestamp,
                            assignedDoctor: slot.assignedDoctor,
                            users: [userEntry],
                        });
                    }
                });
            });
        });

        return mergedData;
    }


    useEffect(() => {
        const result = mergeUserData(doctorsList);
        setOperationSlots(result);
    }, [doctorsList]);




    useEffect(() => {
        if (localStorage.getItem("userInfo")) {
            const data = localStorage.getItem("userInfo");
            if (data) {
                const loginData = JSON.parse(data);
                setClientId(loginData.name);
                dispatch(getAllDoctors())
            }
        }
    }, []);


    console.log(operationSlots)


    const handleUpdateSlot = (updatedSlot) => {
        dispatch(setDoctorsAvailable(updatedSlot));
    };



    function handleSubmit() {
        let updatedAvailableDoctors = availableDoctors;

        if (availableDoctors.users.some((user) => user?.userId === selectedDoctor)) {
            // Update the remark for the selectedDoctor in availableDoctors.users
            updatedAvailableDoctors = {
                ...availableDoctors,
                users: availableDoctors.users.map((user) =>
                    user?.userId === selectedDoctor ? { ...user, remark: selectedRemarks } : user
                ),
            };
        }

        const updatedDoctorList = operationSlots.map((res) => {
            if (
                res?.day === updatedAvailableDoctors?.day &&
                res?.date === updatedAvailableDoctors?.date &&
                res?.timestamp === updatedAvailableDoctors?.timestamp
            ) {
                // Update or create a new entry with the selectedDoctor in operationSlots
                const userEntry = {
                    timestamp: updatedAvailableDoctors?.timestamp,
                    assignedDoctor: selectedDoctor,
                    date: updatedAvailableDoctors?.date,
                    day: updatedAvailableDoctors?.day,
                    users: updatedAvailableDoctors?.users,
                };
                return userEntry;
            }
            return res;
        });

        // Dispatch the action to update the Redux store with the modified doctorsData
        dispatch(updateOperationsCalendar(doctorsData));
        console.log(doctorsData)
        // Update the local state with the modified operationSlots
        setOperationSlots(updatedDoctorList);
        dispatch(setSelectedDoctor(''))

    }

    function logOut() {
        localStorage.clear('userInfo')
        dispatch(setLogout())
        navigate('/')
    }



    const generateTimeSlots = () => {
        const startTime = new Date('2024-01-01T09:00:00');
        const endTime = new Date('2024-01-01T20:00:00');
        const timeSlots = [];

        let currentTime = new Date(startTime);

        while (currentTime <= endTime) {
            let period = 'morning';

            const hour = currentTime.getHours();
            if (hour >= 12 && hour < 17) {
                period = 'afternoon';
            } else if (hour >= 17) {
                period = 'evening';
            }

            timeSlots.push({
                timestamp: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                assignedDoctor: '',
                remark: '',
                period: period,
            });

            currentTime.setMinutes(currentTime.getMinutes() + 15);
        }

        return timeSlots;
    };


    // const currentDayIndex = new Date().getDay();
    const currentDayIndex = 0;

    useEffect(() => {

        const getFormattedDate = (offset) => {
            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + offset);

            const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(targetDate);
            const date = targetDate.getDate();

            return `${month} ${date}`;
        };

        let calendarController = [
            { day: 'Saturday', date: getFormattedDate(0), slots: generateTimeSlots() },
            { day: 'Monday', date: getFormattedDate(2), slots: generateTimeSlots() },
            { day: 'Tuesday', date: getFormattedDate(3), slots: generateTimeSlots() },
            { day: 'Wednesday', date: getFormattedDate(4), slots: generateTimeSlots() },
            { day: 'Thursday', date: getFormattedDate(5), slots: generateTimeSlots() },
            { day: 'Friday', date: getFormattedDate(6), slots: generateTimeSlots() },
            { day: 'Saturday', date: getFormattedDate(0), slots: generateTimeSlots() },
        ];

        // Include the entire week starting from Monday if it's Sunday
        if (currentDayIndex === 0) {
            calendarController = [
                { day: 'Monday', date: getFormattedDate(2), slots: generateTimeSlots() },
                { day: 'Tuesday', date: getFormattedDate(3), slots: generateTimeSlots() },
                { day: 'Wednesday', date: getFormattedDate(4), slots: generateTimeSlots() },
                { day: 'Thursday', date: getFormattedDate(5), slots: generateTimeSlots() },
                { day: 'Friday', date: getFormattedDate(6), slots: generateTimeSlots() },
                { day: 'Saturday', date: getFormattedDate(7), slots: generateTimeSlots() }
            ]
        } else {
            // Filter days before the current day
            calendarController = calendarController.filter((_, index) => index >= currentDayIndex);
        }

        // Now, calendarController contains the desired calendar information

        setCalendar(calendarController)
    }, [])


    const [selectedPeriod, setSelectedPeriod] = useState(''); // Initial state is an empty string


    const handlePeriodChange = (event) => {
        setSelectedPeriod(event.target.value);
    };
    return (
        <section className='flex flex-col items-start p-6'>
            <div className='mb-5 hidden md:flex items-center gap-6 justify-between  w-full '>

                <div className=' flex items-center gap-6'>
                    <span className=' text-white text-xl'>Hello {clientId}</span>
                    <select className='px-8 py-[6px] outline-none' value={selectedPeriod} onChange={handlePeriodChange}>
                        <option className='py-1' value=''>Select a Period</option>
                        <option className='py-1' value='morning'>Morning</option>
                        <option className='py-1' value='afternoon'>Afternoon</option>
                        <option className='py-1' value='evening'>Evening</option>
                    </select>
                </div>
                <span onClick={logOut} className='text-white cursor-pointer'>Logout</span>
            </div>
            <div className='md:border-t-[1px] border-[#FFFFFF80] border-solid w-full md:mb-6'></div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8'>
                {calendar.map((item, index) => {
                    const filteredSlots = selectedPeriod
                        ? item.slots.filter((slot) => slot.period === selectedPeriod)
                        : item.slots;

                    return (
                        <div key={index} className='flex flex-col text-white gap-3'>
                            <ul className='flex flex-col items-center'>
                                <li className='font-semibold'>{item.day}</li>
                                <li>{item.date}</li>
                            </ul>

                            {filteredSlots.map((element, idx) => {
                                const selectedUser = operationSlots?.find(
                                    (res) => res.timestamp === element.timestamp && res.day === item.day && res.date === item.date
                                );

                                const activeBooked = operationSlots.find(
                                    (resultItem) =>
                                        resultItem.timestamp === element.timestamp &&
                                        resultItem.day === item.day &&
                                        resultItem.date === item.date &&
                                        resultItem.assignedDoctor
                                );

                                return (
                                    <span
                                        key={idx}
                                        onClick={() => handleUpdateSlot(selectedUser)}
                                        className={`px-8 py-2 overflow-hidden whitespace-nowrap rounded-md text-center relative ${currentDayIndex === 0 ? 'cursor-pointer' : 'cursor-not-allowed'
                                            } ${operationSlots.some(
                                                (resultItem) =>
                                                    resultItem.timestamp === element.timestamp &&
                                                    resultItem.day === item.day &&
                                                    resultItem.date === item.date
                                            )
                                                ? 'bg-[#00acc1]' // Add your color for matching slots
                                                : 'bg-[#FFFFFF80]' // Default color
                                            }`}
                                    >
                                        {activeBooked?.assignedDoctor ? activeBooked?.assignedDoctor : element.timestamp}
                                    </span>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <div className='border-t-[1px] border-[#FFFFFF80] border-solid w-full mt-10 mb-5'></div>
            <button
                onClick={handleSubmit}
                className='bg-[#081c1f] px-10 py-2 text-white  rounded-md shadow-sm shadow-[#00acc1] font-light'
            >
                SAVE
            </button>
        </section>
    );
};

export default OperationsTable;


