import React from 'react';




export const FormInput = ({svgData, placeholder, type, value, onChange }) => {

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className='flex items-center relative w-full '>
      <span className='absolute left-0 px-2' dangerouslySetInnerHTML={{ __html: svgData }}></span>
      <input
        className='border-solid border-[1px] border-[#AFB9BB] outline-none rounded-[6px] py-[6px] text-[12px] md:text-[16px] md:py-[10px] pl-10 pr-5 w-full text-[#4C5864]  placeholder:text-[#4C5864]'
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={handleInputChange}
        required
      />
    </div>
  );
};

