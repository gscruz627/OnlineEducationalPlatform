import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const Home = () => {
  const token = useSelector( (state) => state.token);
  const role = useSelector( (state) => state.role);
  const user = useSelector( (state) => state.user);
  return (
    <>
    { (!user) && (
      <section className="font-formal" style={{textAlign: "center"}}>
      <h1 className="color-gray" style={{fontSize: "48px"}}>Welcome</h1>
      <p>Please login to access your courses.</p>

      <button style={{margin: "2rem 0", textAlign: "center"}} className='blue-btn'><Link to="/login">Sign In Here</Link></button>
    </section>  
    )}
    { user && (role == "admin") && 
      <section className='font-formal'>
        Welcome admin
      </section>
    }
    </>
  )
}

export default Home