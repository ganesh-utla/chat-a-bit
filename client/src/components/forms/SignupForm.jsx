import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { baseUrl } from '../../utils';

const SignupForm = () => {

  const navigate = useNavigate();

  const [data, setData] = useState({
    fullname: '', email: '', password: ''
  })

  const handleSubmit = async (e) => {

    e.preventDefault();
    await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then((res) => {
        if (res.status===200)
            navigate('/sign-in');
    })
    .catch(() => {
        alert('Something went wrong!!')
    });
  }

  return (
    <div className='flex justify-center items-center h-screen p-2'>
        <form 
            className='w-full max-w-md flex flex-col gap-5 bg-gray-100 px-8 py-10 rounded-xl shadow-md'
            onSubmit={handleSubmit}
        >
            <div className='text-center mb-4'>
                <h2 className='mb-1'>
                    Welcome
                </h2>
                <p>
                    Sign up to get started
                </p>
            </div>

            <input 
                type='text'
                className='input'
                placeholder='Full name'
                name='name'
                value={data.fullname}
                onChange={(e) => setData({...data, fullname: e.target.value})}
            />
            <input 
                type='email'
                className='input'
                placeholder='Email address'
                name='email'
                value={data.email}
                onChange={(e) => setData({...data, email: e.target.value})}
            />
            <input 
                type='password'
                className='input'
                placeholder='Password'
                name='password'
                value={data.password}
                onChange={(e) => setData({...data, password: e.target.value})}
            />

            <button 
                type='submit'
                className='bg-primary-500 text-light-1 p-2 rounded-lg hover:bg-primary-600 active:bg-primary-600 transition-all disabled:cursor-not-allowed'
                disabled={data.fullname==='' || data.email==='' || data.password.length < 6}
            >
                Signup
            </button>

            <div className='flex justify-center gap-1 text-sm'>
                <p>Already have an account? </p>
                <Link to="/sign-in" className='text-primary-500 underline'>
                    Login
                </Link>
            </div>
        </form>
    </div>
  )
}

export default SignupForm