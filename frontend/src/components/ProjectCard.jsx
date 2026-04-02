const ProjectCard = ({ project }) => {
  return (
    <button className="grid grid-flow-row bg-bc border-2 border-sc rounded-xl gap-3 overflow-hidden">
        <h3 className='text-white text-center'>{project.name}</h3>
        <div className="bg-sc w-full h-12"/>
    </button>
  );
};

export default ProjectCard;