
import { useNavigate } from "react-router-dom";

const LeftSideBar = ({ currentUser, conversations, getMessages }) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user:token');
    localStorage.removeItem('user:details');
    navigate('/sign-in');
  }

  return (
    <div className="max-xs:hidden w-1/4 px-6 py-4 flex flex-col gap-10 shadow-lg">
      <div className="mt-10 flex flex-col gap-3 px-5 rounded-lg shadow-md py-6 bg-slate-200">
        <div className="flex gap-5">
          <img
            src="/assets/icons/profile-placeholder.svg"
            className="w-14 h-14 object-contain"
          />
          <div className="flex flex-col">
            <p className="text-xl font-semibold">{currentUser?.fullname}</p>
            <p className="text-gray-2">{currentUser?.email}</p>
          </div>
        </div>
        <button 
          className="bg-primary-500 py-2 shadow-sm text-light-1 rounded-md"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="flex flex-col h-[10%] flex-grow">
        <p className="text-primary-500">Members</p>

        {conversations.length===0? (
          <div className="mt-8 flex flex-col gap-6 h-[10%] pb-2 flex-grow text-gray-1 justify-center items-center">
            No members found
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-6 overflow-auto h-[10%] pb-2 flex-grow">
            {conversations.map(({ user: member, conversationId }) => (
              <div
                className="flex bg-stone-200 gap-4 items-center rounded-lg shadow-md py-3 px-4 cursor-pointer"
                key={conversationId}
                onClick={() => getMessages(conversationId, member)}
              >
                <img 
                  src={member.image? member.image : "/assets/icons/profile-placeholder.svg"} 
                  className="w-10 h-10 object-contain" 
                />
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">{member.fullname}</p>
                  <p className="text-sm text-gray-2">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSideBar;
