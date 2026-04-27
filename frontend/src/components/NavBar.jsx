import React from 'react';
import { jwtDecode } from "jwt-decode";

const NavBar = ({ extraLeft, extraRight }) => {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userName = decoded.name;

  return (
    <div className='flex items-center justify-between bg-bc px-12 py-3 border-b border-b-sc'>
      <div className="flex items-center gap-4">
        <h3 className='text-white'>Home</h3>
        {extraLeft}
      </div>

      <div className='flex items-center gap-4'>
        {extraRight}
        <h3 className='text-white'>{userName}</h3>
        <button className="w-10 h-10 rounded-full overflow-hidden bg-pm" />
      </div>
    </div>
  );
};

export default NavBar;