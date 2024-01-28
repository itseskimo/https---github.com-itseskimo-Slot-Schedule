import { FormInput } from '../../components/FormInput/FormInput';
import {  useEffect, useState } from 'react';
import { formSvgData } from '../../config/data';
import Dropdown from '../../components/Dropdown/Dropdown';
import { register, login ,setError} from '../../redux/features/doctor/doctorSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Auth = () => {

    const dispatch = useDispatch();
    const { role, userInfo ,error} = useSelector((state) => state.doctor);
    const navigate = useNavigate();

    const [formToggler, setFormToggler] = useState(false)

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });


    const handleInputChange = (fieldName, value) => {

        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: value,
        }));
    };

    function handleSubmit(e) {
        e.preventDefault()

        if (formData.username && formData.password && role && formToggler) {
            dispatch(register({ username: formData.username, password: formData.password, role }))
            alert('Register Successful. Please Login')
            setFormToggler(false)
        }
        if (formData.username && formData.password && !formToggler) {
            dispatch(login({ username: formData.username, password: formData.password }))
        }

    }


    useEffect(() => {
        if (Object.keys(userInfo || {}).length) {
            let userData = JSON.stringify(userInfo);
            localStorage.setItem("userInfo", userData);

            if (userInfo?.role === 'Physio') {
                navigate('/physio')
            } else if (userInfo?.role === 'Operations') {
                navigate('/operations')
            } else if (userInfo?.role === 'Patient') {
                navigate('/patient')
            }
        }

        if(localStorage.getItem('userInfo')){
            let data = localStorage.getItem('userInfo')
            let loginData = JSON.parse(data);
        
            if (loginData?.role === 'Physio') {
                navigate('/physio')
            } else if (loginData?.role === 'Operations') {
                navigate('/operations')
            } else if (loginData?.role === 'Patient') {
                navigate('/patient')
            }
          }

          if(error){
            alert(error.message)
            dispatch(setError())
          }
    }, [userInfo,error])


    return (
        <main className='bg-[#060f17] flex items-center justify-center h-screen'>

            <div className='before:absolute before:inset-[1px] before:bg-[#060f17] before:rounded-2xl form-bg relative justify-self-center self-center rounded-2xl py-8  px-5   w-[360px] '>

                <form className='flex flex-col gap-4'>
                    <legend className='text-white text-center text-2xl  z-30'>{formToggler ? 'Sign Up' : 'Login'}</legend>
                    <FormInput svgData={formSvgData[0]} placeholder='Name' type='text' value={formData.username} onChange={(value) => handleInputChange('username', value)} />
                    <FormInput svgData={formSvgData[1]} placeholder='Password' type='password' value={formData.password} onChange={(value) => handleInputChange('password', value)} />
         

                    
  
                    {formToggler && <Dropdown />}
                    {!formToggler && <p className='text-white text-right text-xs  z-10'>Not Registered? <span className='cursor-pointer underline underline-offset-2' onClick={() => [setFormToggler(true), setFormData({ username: '', password: '' })]}>Sign Up</span></p>}
                    <button className='submitBtn' onClick={handleSubmit}>
                        <section className='submitBtnOverlay'></section>
                        <span></span>
                        <h6>Submit</h6>
                    </button>

                </form>
            </div>
        </main>

    )
}

export default Auth