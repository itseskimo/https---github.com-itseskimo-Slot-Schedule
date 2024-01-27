import { FormInput } from '../../components/FormInput/FormInput';
import { SyntheticEvent, useEffect, useState } from 'react';
import { formSvgData } from '../../config/data';
import Dropdown from '../../components/Dropdown/Dropdown';
import { register, login } from '../../redux/features/doctor/doctorSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Auth = () => {

    const dispatch = useDispatch();
    const { role, userInfo } = useSelector((state) => state.doctor);
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
    }, [userInfo])


    return (
        <main className='bg-[#060f17] flex items-center justify-center h-screen'>

            <div className='before:absolute before:inset-[1px] before:bg-[#060f17] before:rounded-2xl form-bg relative justify-self-center self-center rounded-2xl py-8  px-5   w-[360px] '>

                <form className='flex flex-col gap-4'>
                    <legend className='text-white text-center text-2xl  z-30'>{formToggler ? 'Sign Up' : 'Login'}</legend>
                    <FormInput svgData={formSvgData[0]} placeholder='Name' type='text' value={formData.username} onChange={(value) => handleInputChange('username', value)} />
                    <FormInput svgData={formSvgData[1]} placeholder='Password' type='password' value={formData.password} onChange={(value) => handleInputChange('password', value)} />
         

                    <svg
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 108.05 122.88"
    style={{
      enableBackground: "new 0 0 108.05 122.88",
    }}
    xmlSpace="preserve"

    >
    <style type="text/css" />
    <g>
      <path
        className="st0"
        d="M2.89,56.04h14.93v-1.08V37.12c0-10.21,4.18-19.48,10.9-26.21V10.9C35.44,4.18,44.73,0,54.94,0 c10.2,0,19.48,4.18,26.21,10.9l0.01,0.01c6.72,6.72,10.9,16,10.9,26.21v17.84v1.07l13.11,0c1.59,0,2.89,1.3,2.89,2.89v61.06 c0,1.59-1.3,2.89-2.89,2.89H2.89c-1.59,0-2.89-1.3-2.89-2.89V58.93C0,57.34,1.3,56.04,2.89,56.04L2.89,56.04L2.89,56.04z M25.79,85.79c4.37,0,7.92,3.54,7.92,7.91c0,4.37-3.54,7.92-7.92,7.92c-4.37,0-7.92-3.54-7.92-7.92 C17.87,89.33,21.41,85.79,25.79,85.79L25.79,85.79z M82.27,85.79c4.37,0,7.91,3.54,7.91,7.91c0,4.37-3.54,7.92-7.91,7.92 c-4.37,0-7.92-3.54-7.92-7.92C74.35,89.33,77.9,85.79,82.27,85.79L82.27,85.79z M54.03,85.79c4.37,0,7.91,3.54,7.91,7.91 c0,4.37-3.54,7.92-7.91,7.92c-4.37,0-7.92-3.54-7.92-7.92C46.11,89.33,49.65,85.79,54.03,85.79L54.03,85.79z M15.59,79.96h76.86 c4.1,0,7.45,3.35,7.45,7.44V100c0,4.09-3.35,7.44-7.45,7.44H15.59c-4.09,0-7.44-3.35-7.44-7.44V87.4 C8.15,83.31,11.5,79.96,15.59,79.96L15.59,79.96z M32.24,56.04h45.39v-1.08V36.91c0-6.24-2.55-11.92-6.66-16.03l0,0 c-4.11-4.11-9.79-6.67-16.02-6.67c-6.24,0-11.92,2.55-16.03,6.66c-4.11,4.11-6.66,9.79-6.66,16.03v18.05L32.24,56.04L32.24,56.04 L32.24,56.04z"
      />
    </g>
  </svg>
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