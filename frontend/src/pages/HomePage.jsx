import React from 'react';
import axios from "axios";
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from "react-router";
import {jwtDecode} from "jwt-decode";

const HomePage = () => {
  
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = decoded.id;
  
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async() => {
      try {
        const res = await axios.get(`http://localhost:5001/api/projects/${userId}`);
        setProjects(res.data);
      } catch (error) {
        console.log("Error Fetching Notes !");
      }
    };

    fetchProjects();
  }, []);
  
  
  return (
    <div className="bg-bc min-h-screen">

      <NavBar/>
      
      <div className='p-10'>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10'>
          {projects.map(project => (
            <ProjectCard key={project._id} project={project}/>
          ))}

          <button className="flex items-center justify-center bg-sc rounded-xl h-20 w-20 text-white text-3xl pb-2" onClick={() => navigate("/create-project")}>+</button>
        </div>

      </div>
    </div>
  );


};

export default HomePage
