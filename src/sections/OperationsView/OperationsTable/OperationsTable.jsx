import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllDoctors, setDoctorsAvailable, setSelectedDoctor, updateOperationsCalendar, setLogout } from '../../../redux/features/doctor/doctorSlice';
import { useSelector, useDispatch } from 'react-redux';
import React from 'react';

const OperationsTable = () => {

    const dispatch = useDispatch();
    const { doctorsList, availableDoctors, selectedDoctor, selectedRemarks } = useSelector((state) => state.doctor);
    const [clientId, setClientId] = useState('');
    const [active, setActive] = useState('');
    const [operationSlots, setOperationSlots] = useState([]);
    const navigate = useNavigate();
    const [calendar, setCalendar] = useState([]);



    const transformScheduleArrayToOriginalData = (doctorList, scheduleArray) => {
        return doctorList.map(user => {
            const updatedCalendars = user.calendars.map(calendar => {
                const matchingSchedules = scheduleArray.filter(schedule =>
                    calendar.day === schedule.day && calendar.date === schedule.date
                );
    
                if (matchingSchedules.length > 0) {
                    const updatedSlots = calendar.selectedSlots.map(slot => {
                        const matchingSchedule = matchingSchedules.find(schedule =>
                            slot.timestamp === schedule.timestamp
                        );
    
                        if (matchingSchedule) {
                            const userEntry = {
                                timestamp: matchingSchedule.timestamp,
                                period: slot.period,
                                assignedDoctor: matchingSchedule.assignedDoctor,
                                users: matchingSchedule.users.map(user =>
                                    user.userId === user.userId ? { userId: user.userId, remarks: user.remarks } : user
                                )
                            };
    
                            return userEntry;
                        }
    
                        return slot;
                    });
    
                    return { ...calendar, selectedSlots: updatedSlots };
                }
    
                return calendar;
            });
    
            return { ...user, calendars: updatedCalendars };
        });
    };
    

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




    const handleUpdateSlot = (updatedSlot) => {
        dispatch(setDoctorsAvailable(updatedSlot));
        dispatch(setSelectedDoctor(''))
    };


    function handleSubmit() {
        let updatedAvailableDoctors = availableDoctors;
        alert('Slot has been updated')
        if (availableDoctors.users.some((user) => user?.userId === selectedDoctor)) {
            // Update the remark for the selectedDoctor in availableDoctors.users
            updatedAvailableDoctors = {
                ...availableDoctors,
                users: availableDoctors.users.map((user) =>
                    user?.userId === selectedDoctor ? { ...user, remarks: selectedRemarks } : user
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


        const updatedOriginalData = transformScheduleArrayToOriginalData(doctorsList, updatedDoctorList, doctorsList[0]?.userId);
     console.log(updatedOriginalData)
        dispatch(updateOperationsCalendar(updatedOriginalData));
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
        const endTime = new Date('2024-01-01T18:00:00');
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

                    // Filter slots based on the selected period
                    const filteredSlots = selectedPeriod
                        ? item.slots.filter((slot) => slot.period === selectedPeriod)
                        : item.slots;

                    // Create toggleArray based on some condition (operationSlots in this case)
                    const toggleArray = filteredSlots.filter((slot) => {
                        // Replace the condition below with your actual condition
                        return operationSlots.some((ele) => ele.day === item.day && ele.date === item.date && ele.timestamp === slot.timestamp);
                    });

                    return (
                        <div key={index} className='flex flex-col text-white gap-3'>
                            <ul className='flex flex-col items-center'>
                                <li className='font-semibold'>{item.day}</li>
                                <li>{item.date}</li>
                            </ul>

                            {toggleArray.map((element, idx) => {

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
                                        style={{ background: availableDoctors?.timestamp === element.timestamp && availableDoctors?.day === item.day &&  'linear-gradient(90deg, rgba(6,15,23,1) 0%, rgba(4,65,78,1) 48%, rgba(2,109,126,1) 76%, rgba(1,127,146,1) 100%, rgba(0,172,193,1) 100%, rgba(0,172,193,1) 100%, rgba(0,172,193,1) 100%)' }}

                                        className={`px-8 py-2 ${availableDoctors?.timestamp === element.timestamp  && availableDoctors?.day === item.day && 'shadow-sm shadow-[#00acc1]'} overflow-hidden whitespace-nowrap rounded-md text-center relative ${currentDayIndex === 0 ? 'cursor-pointer' : 'cursor-not-allowed'
                                            } ${activeBooked?.assignedDoctor
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


