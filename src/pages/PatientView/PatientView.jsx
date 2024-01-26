import PhysioDetails from "../../sections/PhysioView/PhysioDetails/PhysioDetails"
import PatientTable from "../../sections/PatientView/PatientTable/PatientTable"

const PatientView = () => {
    return (
        <main className='bg-[#060f17] flex items-center justify-center'>
            <main
                style={{ background: 'linear-gradient(90deg, rgba(6,15,23,1) 0%, rgba(4,65,78,1) 48%, rgba(2,109,126,1) 76%, rgba(1,127,146,1) 100%, rgba(0,172,193,1) 100%, rgba(0,172,193,1) 100%, rgba(0,172,193,1) 100%)' }}
                className='grid grid-cols-[30%,70%] '>
                <PhysioDetails />
                <PatientTable />
            </main>
        </main>)
}

export default PatientView