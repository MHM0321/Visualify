import { useNavigate } from 'react-router';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <button
      className="grid grid-flow-row bg-bc border-2 border-sc rounded-xl gap-3 overflow-hidden hover:border-pm transition"
      onClick={() => navigate(`/project/${project._id}`)}
    >
      <h3 className="text-white text-center pt-3 px-2">{project.name}</h3>
      <div className="bg-sc w-full h-12" />
    </button>
  );
};

export default ProjectCard;