import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { baseUrl } from '../../utils';

const SigninForm = () => {

  const navigate = useNavigate();

  const [data, setData] = useState({
    email: '', password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (res.status!==200) {
        return alert('Something went wrong!!');
    }

    const resData = await res.json();
    localStorage.setItem('user:token', resData.token);
    localStorage.setItem('user:details', JSON.stringify(resData.user));
    navigate('/');
  }

  return (
    <div className='flex justify-center items-center h-screen p-2'>
        <form 
            className='w-full max-w-sm flex flex-col gap-5 bg-gray-100 px-8 py-10 rounded-xl shadow-md'
            onSubmit={handleSubmit}
        >
            <div className='text-center mb-4'>
                <h2 className='mb-1'>
                    Welcome Back
                </h2>
                <p>
                    Sign in to get explored
                </p>
            </div>

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
                disabled={data.email==='' || data.password.length < 6}
            >
                Login
            </button>

            <div className='flex justify-center gap-1 text-sm'>
                <p>Didn't have an account? </p>
                <Link to="/sign-up" className='text-primary-500 underline'>
                    Signup
                </Link>
            </div>
        </form>
    </div>
  )
}

export default SigninForm