import React from 'react'
import { jwtDecode } from "jwt-decode";

const NavBar = () => {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userName = decoded.name;

  return (
    <div className='flex items-center justify-between bg-bc px-12 py-3 border-b border-b-sc'>
      <h3 className='text-white'>Home</h3>
      
      <div className='flex items-center gap-4'>
        <h3 className='text-white'>{userName}</h3>
        <button className="w-10 h-10 rounded-full overflow-hidden bg-pm">
            {/*<img src={pfpUrl} alt="profile" className="w-full h-full object-cover" />*/}
        </button>
      </div>
      
    </div>
  )
}

export default NavBar
