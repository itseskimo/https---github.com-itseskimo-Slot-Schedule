import { useState, useEffect } from 'react';
import { addPhysioCalendar, getPhysioCalendar, setLogout, setSuccessReset, setSuccessMsg, setRemovedSlots, convertToDesiredFormat } from '../../../redux/features/doctor/doctorSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PhysioTable = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookedSlots, isPhysioSuccess, timestamp, removedSlots } = useSelector((state) => state.doctor);
    const [selectedDates, setSelectedDates] = useState([]);
    const [calendar, setCalendar] = useState([]);
    const [clientId, setClientId] = useState('');
    const [token, setToken] = useState('');

    // const currentDayIndex = new Date().getDay();
    const currentDayIndex = 0;

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

        setCalendar(calendarController)

    }, []);


    function removeNonSelectedSlots(calendar, selectedDates) {
        const newCalendar = [];

        calendar.forEach(calendarDay => {
            const newCalendarDay = { ...calendarDay }; // Copy the calendar day
            const selectedDay = selectedDates.find(day => day.date === calendarDay.date);

            if (selectedDay) {
                newCalendarDay.slots = calendarDay.slots.filter(calendarSlot =>
                    selectedDay.selectedSlots.some(selectedSlot => selectedSlot.timestamp === calendarSlot.timestamp)
                );
            }

            newCalendar.push(newCalendarDay); // Push the modified calendar day into the new array
        });

        return newCalendar;
    }


    useEffect(() => {

        if (bookedSlots && bookedSlots[0]?.calendars?.length) {
            setSelectedDates((bookedSlots && bookedSlots[0]?.calendars) ?? []);

            const newCalendar = removeNonSelectedSlots(calendar, selectedDates);
            setCalendar(newCalendar)
        }

    }, [bookedSlots]);




    function handleSubmit() {
        dispatch(setSuccessMsg('Please Wait while the Slots are being updated...'))
        const physioData = selectedDates;
        dispatch(addPhysioCalendar({ physioData, token }));
    }


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
                    const slotTime = new Date(`2022-01-30 ${slot?.timestamp}`).getTime();
                    if (slotTime === selectedTime && day === dayData.day && date === dayData.date) {
                        return false;
                    }
                    return (slotTime > selectedTime && slotTime <= next45Minutes && day === dayData.day && date === dayData.date);
                });


            if (deletedSlots.length) {
                dispatch(setRemovedSlots(deletedSlots));
            }

            return {
                ...dayData,
                slots: dayData.slots.filter((slot) => {
                    const slotTime = new Date(`2022-01-30 ${slot?.timestamp}`).getTime();

                    // Keep the selected slot even if it falls within the time range
                    if (slotTime === selectedTime && day === dayData.day && date === dayData.date) {
                        return true;
                    }

                    return !(slotTime > selectedTime && slotTime <= next45Minutes && day === dayData.day && date === dayData.date);
                }),
            };
        });

        setCalendar(filteredData);
        // ------------------------------------------------

        let data = selectedDates.map((dayData) => {

            return {
                ...dayData,
                selectedSlots: dayData.selectedSlots.filter((slot) => {
                    const slotTime = new Date(`2022-01-30 ${slot?.timestamp}`).getTime();

                    return !(slotTime > selectedTime && slotTime <= next45Minutes && day === dayData.day && date === dayData.date);
                }),
            };
        });
        setSelectedDates(data)


        let res = data.map((element) => {
            return {
                ...element,  // Retain other properties of the element
                selectedSlots: element.selectedSlots.filter((ele) => {
                    // Convert the timestamp of the current element in selectedSlots to milliseconds
                    let selectedSlotTime = new Date(`2022-01-30 ${ele?.timestamp}`).getTime();

                    // Calculate the time difference in minutes
                    let timeDifferenceInMinutes = (selectedSlotTime - selectedTime) / (60 * 1000);

                    // Check if the time difference is more than or equal to 1 hour but less than or equal to 75 minutes
                    return 60 <= timeDifferenceInMinutes && timeDifferenceInMinutes <= 75 && day === element.day && date === element.date;
                }),
            };
        });
        const anySelectedSlotsWithinNext75Minutes = res.some(element => element.selectedSlots.length > 0);




        let result = data.map((element) => {
            let opted = element.selectedSlots.find((ele) => {
                // Convert the timestamp of the current element in selectedSlots to milliseconds
                let selectedSlotTime = new Date(`2022-01-30 ${ele?.timestamp}`).getTime();

                // Calculate the time difference in minutes
                let timeDifferenceInMinutes = (selectedSlotTime - selectedTime) / (60 * 1000);

                // Check if the time difference is more than or equal to 1 hour but less than or equal to 75 minutes
                return 60 <= timeDifferenceInMinutes && timeDifferenceInMinutes <= 75 && day === element.day && date === element.date;
            });

            return opted && opted

        });


        let answer = result.filter((item) => item !== undefined)
        let ans = answer[0]?.timestamp




        // ------------------------------------------------
        setSelectedDates((prevDates) => {
            const existingDateIndex = prevDates.findIndex((dateObj) => dateObj.date === date);

            if (existingDateIndex !== -1) {

                // Date already exists, toggle selectedSlot
                return prevDates.map((dateObj, index) => {
                    if (index === existingDateIndex) {
                        // Update the existing date
                        const existingSlots = dateObj.selectedSlots;
                        const existingSlotIndex = existingSlots.findIndex((slot) => slot?.timestamp === selectedSlot.timestamp);



                        if (existingSlotIndex !== -1) {
                            // SelectedSlot already exists, remove it

                            const selectedInterval = new Date(`2022-01-30 ${selectedSlot.timestamp}`).getTime();
                            const next45Min = selectedInterval + 30 * 60 * 1000;  // Use selectedInterval instead of selectedTime


                            let additBack = removedSlots.filter(element => {
                                const slotTime = new Date(`2022-01-30 ${element.timestamp}`).getTime();
                                return (
                                    slotTime > selectedInterval &&
                                    slotTime <= next45Min &&
                                    day === element.day &&
                                    date === element.date
                                );
                            }).sort((a, b) => new Date(`2022-01-30 ${a.timestamp}`).getTime() - new Date(`2022-01-30 ${b.timestamp}`).getTime());





                            const updatedDaysArray = filteredData.map(dayObj => {
                                const updatedSlots = dayObj.slots.map(slot => {
                                    // const isTimestampPresent = dayObj.slots.some(slot => slot?.timestamp === selectedSlot.timestamp);
                                    // if (!isTimestampPresent) return
                                    if (slot?.timestamp === selectedSlot.timestamp && dateObj.date === date && dayObj.day === day) {
                                        // Matched timestamp, add the two values
                                        return [
                                            slot,
                                            ...additBack
                                        ]
                                    }
                                    return slot;
                                });

                                return {
                                    ...dayObj,
                                    slots: updatedSlots.flat(Infinity)
                                };
                            });


                            setCalendar(updatedDaysArray);



                            return {
                                ...dateObj,
                                selectedSlots: [
                                    ...existingSlots.slice(0, existingSlotIndex),
                                    ...existingSlots.slice(existingSlotIndex + 1),
                                ],
                            };
                        } else {

                            const updatedDaysArray = filteredData.map(dayObj => {
                                const updatedSlots = dayObj.slots.map(slot => {


                                    if (slot?.timestamp === selectedSlot.timestamp && dateObj?.date === date && dayObj?.day === day) {
                                        // Matched timestamp, add the two values
                                        if (anySelectedSlotsWithinNext75Minutes) {


                                            const date1 = new Date(`2000-01-01 ${ans}`);
                                            const date2 = new Date(`2000-01-01 ${selectedSlot.timestamp}`);

                                            const differenceInMinutes = Math.abs((date2 - date1) / (1000 * 60));


                                            // Add 45 minutes to date2
                                            date2.setMinutes(date2.getMinutes() + 45);

                                            // Subtract 15 minutes from date1
                                            date1.setMinutes(date1.getMinutes() - 15);

                                            const formatHour = (hour) => {
                                                hour = hour % 12 || 12; // Ensure 12-hour format
                                                return hour.toString().padStart(2, '0');
                                            };

                                            const resultTimestamp1 = `${formatHour(date1.getHours())}:${String(date1.getMinutes()).padStart(2, '0')} ${date1.getHours() >= 12 ? 'PM' : 'AM'}`;
                                            const resultTimestamp2 = `${formatHour(date2.getHours())}:${String(date2.getMinutes()).padStart(2, '0')} ${date2.getHours() >= 12 ? 'PM' : 'AM'}`;



                                            if (differenceInMinutes > 60) {
                                                // If the difference is more than 1 hour, do something
                                                const isUnique = dayObj.slots.some(slot => slot?.timestamp === resultTimestamp1);
                                                console.log(isUnique)
                                                if (isUnique) {
                                                    return [
                                                        slot
                                                    ]
                                                } else {
                                                    return [
                                                        slot,
                                                        { timestamp: resultTimestamp2 },
                                                        { timestamp: resultTimestamp1 }
                                                    ]
                                                }

                                            } else if (differenceInMinutes === 60) {
                                                // If the difference is exactly 1 hour, do something else
                                                const isUnique = dayObj.slots.some(slot => slot?.timestamp === resultTimestamp2);
                                                if (isUnique) {
                                                    return [
                                                        slot
                                                    ]
                                                } else {
                                                    return [
                                                        slot,
                                                        { timestamp: resultTimestamp2 }
                                                    ]
                                                }


                                            }

                                        } else {
                                            return [
                                                slot
                                            ]
                                        }

                                    }
                                    return slot;
                                });

                                return {
                                    ...dayObj,
                                    slots: updatedSlots.flat(Infinity)
                                };
                            });


                            setCalendar(updatedDaysArray);

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
                                (slot) => slot?.timestamp === element?.timestamp
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
                                    {element?.timestamp}
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