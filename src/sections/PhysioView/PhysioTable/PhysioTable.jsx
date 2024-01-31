import { useState, useEffect } from 'react';
import { addPhysioCalendar, getPhysioCalendar, setLogout, setSuccessReset, setRemovedSlots, convertToDesiredFormat } from '../../../redux/features/doctor/doctorSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PhysioTable = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookedSlots, isPhysioSuccess, timestamp } = useSelector((state) => state.doctor);
    const [selectedDates, setSelectedDates] = useState([]);
    const [calendar, setCalendar] = useState([]);
    const [clientId, setClientId] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        if (localStorage.getItem("userInfo")) {
            const data = localStorage.getItem("userInfo");
            if (data) {
                const loginData = JSON.parse(data);
                setClientId(loginData.name);
                setToken(loginData.token);
                dispatch(getPhysioCalendar({ token: loginData.token }))
            }
        }
    }, []);


    useEffect(() => {
        setSelectedDates((bookedSlots && bookedSlots[0]?.calendars) ?? []);
    }, [bookedSlots]);



    useEffect(() => {
        if (isPhysioSuccess?.status === 200) {
            alert('Slots Successfully Booked')
            dispatch(setSuccessReset())
        }

        if (timestamp) {

            setCalendar(prevCalendar => prevCalendar.map(element => {
                if (element.day === timestamp.day && element.date === timestamp.date) {
                    const isTimeStampExists = element.slots.some(item => item.timestamp === timestamp.timestamp);

                    if (isTimeStampExists) return element
                    const updatedSlots = [...element.slots, timestamp].sort((a, b) => {

                        const timeA = new Date(`2022-01-30 ${a.timestamp}`);
                        const timeB = new Date(`2022-01-30 ${b.timestamp}`);
                        return timeA - timeB;
                    });
                    return {
                        ...element,
                        slots: updatedSlots
                    };
                }
                return element;
            }));



            function filterObjects(array, selectedTime) {
                return array.map(obj => {
                    if (obj.day === selectedTime.day && obj.date === selectedTime.date) {
                        obj.slots = obj.slots.filter(slot => {
                            const slotTimestamp = convertTimeToTimestamp(slot.timestamp);
                            const selectedTimestamp = convertTimeToTimestamp(selectedTime.timestamp);
                            if (selectedTimestamp <= slotTimestamp && slotTimestamp - selectedTimestamp <= 30 * 60 * 1000) {
                                dispatch(setRemovedSlots({ ...slot, day: obj.day, date: obj.date }));
                                dispatch(convertToDesiredFormat({ ...slot, day: obj.day, date: obj.date }));

                            }
                            return !(selectedTimestamp <= slotTimestamp && slotTimestamp - selectedTimestamp <= 30 * 60 * 1000);
                        });
                    }
                    return obj;
                });
            }

            function convertTimeToTimestamp(timeString) {
                const [hours, minutes] = timeString.split(':');
                const date = new Date();
                date.setHours(parseInt(hours, 10));
                date.setMinutes(parseInt(minutes, 10));
                return date.getTime();
            }

            let filteredArray = filterObjects(calendar, timestamp);

            // setSelectedDates((selectedDates) => (
            //     selectedDates.map(dateObj => ({
            //         ...dateObj,
            //         selectedSlots: dateObj.selectedSlots.filter(slot =>
            //             !(slot.timestamp === timestamp.timestamp && dateObj.day === timestamp.day && dateObj.date === timestamp.date)
            //         )
            //     }))
            // ));

            // const selectedTim = new Date(`2022-01-30 ${timestamp.timestamp}`).getTime();
            // const prev30Minutes = selectedTim - 30 * 60 * 1000;
            // const next30Minutes = selectedTim + 30 * 60 * 1000;

            // setSelectedDates((selectedDates) =>
            //     selectedDates.map((dayData) => {
            //         return {
            //             ...dayData,
            //             selectedSlots: dayData.selectedSlots.filter((slot) => {
            //                 const slotTime = new Date(`2022-01-30 ${slot.timestamp}`).getTime();
            //                 return !(slotTime >= prev30Minutes && slotTime <= next30Minutes);
            //             }),
            //         };
            //     })
            // );




            const selectedTim = new Date(`2022-01-30 ${timestamp.timestamp}`).getTime();
            const prev30Minutes = selectedTim - 30 * 60 * 1000;
            const next30Minutes = selectedTim + 30 * 60 * 1000;

            setSelectedDates((selectedDates) =>
                selectedDates.map((dayData) => {
                    return {
                        ...dayData,
                        selectedSlots: dayData.selectedSlots.filter((slot) => {
                            const slotTime = new Date(`2022-01-30 ${slot.timestamp}`).getTime();

                            if (slotTime === selectedTim && timestamp.day === dayData.day && timestamp.date === dayData.date) {
                                return true;
                            }
                            return !(slotTime >= prev30Minutes && slotTime <= next30Minutes && dayData.day === timestamp.day && dayData.date === timestamp.date);
                        }),
                    };
                })
            );

        }
    }, [isPhysioSuccess, timestamp]);



    function handleSubmit() {
        const physioData = selectedDates;
        dispatch(addPhysioCalendar({ physioData, token }));
    }

    console.log(selectedDates, 'selectedates')
    function handleClick(day, date, selectedSlot) {

        const selectedTime = new Date(`2022-01-30 ${selectedSlot.timestamp}`).getTime();
        const next45Minutes = selectedTime + 30 * 60 * 1000;

        let filteredData = calendar.map((dayData) => {



            const deletedSlots = dayData.slots
                .map(slot => ({
                    ...slot,
                    day: dayData.day,
                    date: dayData.date
                }))
                .filter(slot => {
                    const slotTime = new Date(`2022-01-30 ${slot.timestamp}`).getTime();
                    if (slotTime === selectedTime && day === dayData.day && date === dayData.date) {
                        return false;
                    }
                    return (slotTime > selectedTime && slotTime <= next45Minutes && day === dayData.day && date === dayData.date);
                });


            if (deletedSlots.length) {
                dispatch(setRemovedSlots(deletedSlots));
                dispatch(convertToDesiredFormat(deletedSlots));
            }

            return {
                ...dayData,
                slots: dayData.slots.filter((slot) => {
                    const slotTime = new Date(`2022-01-30 ${slot.timestamp}`).getTime();

                    // Keep the selected slot even if it falls within the time range
                    if (slotTime === selectedTime && day === dayData.day && date === dayData.date) {
                        return true;
                    }

                    return !(slotTime > selectedTime && slotTime <= next45Minutes && day === dayData.day && date === dayData.date);
                }),
            };
        });

        setCalendar(filteredData);

        if (currentDayIndex !== 0) {
            alert(`Slots available for Physios can only be selected on Sunday's`);
            return;
        }

        setSelectedDates((prevDates) => {
            const existingDateIndex = prevDates.findIndex((dateObj) => dateObj.date === date);

            if (existingDateIndex !== -1) {
                // Date already exists, toggle selectedSlot
                return prevDates.map((dateObj, index) => {
                    if (index === existingDateIndex) {
                        // Update the existing date
                        const existingSlots = dateObj.selectedSlots;
                        const existingSlotIndex = existingSlots.findIndex((slot) => slot.timestamp === selectedSlot.timestamp);

                        if (existingSlotIndex !== -1) {
                            // SelectedSlot already exists, remove it
                            return {
                                ...dateObj,
                                selectedSlots: [
                                    ...existingSlots.slice(0, existingSlotIndex),
                                    ...existingSlots.slice(existingSlotIndex + 1),
                                ],
                            };
                        } else {
                            // SelectedSlot doesn't exist, add it
                            return { ...dateObj, selectedSlots: [...existingSlots, selectedSlot] };
                        }
                    }
                    return dateObj;
                });
            } else {
                // Date doesn't exist, create a new object with a unique selectedSlot
                return [...prevDates, { day, date, selectedSlots: [selectedSlot] }];
            }
        });




        const selectedTim = new Date(`2022-01-30 ${selectedSlot.timestamp}`).getTime();
        const prev30Minutes = selectedTim - 30 * 60 * 1000;
        const next30Minutes = selectedTim + 30 * 60 * 1000;

        setSelectedDates((selectedDates) =>
            selectedDates.map((dayData) => {
                return {
                    ...dayData,
                    selectedSlots: dayData.selectedSlots.filter((slot) => {
                        const slotTime = new Date(`2022-01-30 ${slot.timestamp}`).getTime();

                        if (slotTime === selectedTim && day === dayData.day && date === dayData.date) {
                            return true;
                        }
                        return !(slotTime >= prev30Minutes && slotTime <= next30Minutes && dayData.day === day && dayData.date === date);
                    }),
                };
            })
        );





        // const selectedTim = new Date(`2022-01-30 ${selectedSlot.timestamp}`).getTime();
        // const prev30Minutes = selectedTime - 30 * 60 * 1000;


        // setSelectedDates((selectedDates) =>
        //     selectedDates.map((dayData) => {
        //         return {
        //             ...dayData,
        //             selectedSlots: dayData.selectedSlots.filter((slot) => {
        //                 const slotTime = new Date(`2022-01-30 ${slot.timestamp}`).getTime();
        //                 return !(slotTime >= prev30Minutes && slotTime < selectedTim && dayData.day === day && dayData.date === date)
        //             }),
        //         };
        //     })

        // );

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


    function logOut() {
        localStorage.clear('userInfo')
        dispatch(setLogout())
        navigate('/')
    }

    return (
        <section className='flex flex-col items-start p-6'>

            <div className='md:mb-5 hidden md:flex items-center gap-6 justify-between  w-full '>
                <span className=' text-white text-xl'>Hello {clientId}</span>
                <span onClick={logOut} className='text-white cursor-pointer'>Logout</span>
            </div>

            <div className='md:border-t-[1px] border-[#FFFFFF80] border-solid w-full md:mb-6'></div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8'>
                {calendar.map((item, index) => (
                    <div key={index} className='flex flex-col text-white gap-3'>
                        <ul className='flex flex-col items-center'>
                            <li className='font-semibold'>{item?.day}</li>
                            <li>{item?.date}</li>
                        </ul>
                        {item.slots.map((element, idx) => {
                            const isSelected = selectedDates.find(
                                (date) => date.date === item.date
                            )?.selectedSlots?.some(
                                (slot) => slot.timestamp === element.timestamp
                            );

                            return (
                                <span
                                    key={idx}
                                    onClick={() => handleClick(item.day, item.date, element)}
                                    className={`px-8 py-2 whitespace-nowrap rounded-md text-center relative  ${currentDayIndex === 0 ? 'cursor-pointer' : 'cursor-not-allowed'
                                        } ${isSelected
                                            ? 'bg-[#00acc1] ' // Color for selected slots
                                            : 'bg-[#FFFFFF80] ' // Default color
                                        }`}
                                >
                                    {element.timestamp}
                                </span>
                            );
                        })}
                    </div>
                ))}
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

export default PhysioTable;


