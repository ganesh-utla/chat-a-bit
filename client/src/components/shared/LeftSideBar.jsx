
import { useNavigate } from "react-router-dom";

const LeftSideBar = ({ showLeftSideBar, setShowLeftSideBar, currentUser, conversations, getMessages }) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user:token');
    localStorage.removeItem('user:details');
    navigate('/sign-in');
  }

  return (
    <div className={`max-lg:${showLeftSideBar? 'absolute top-0 left-0 w-[95%]' : 'hidden'} w-1/4  max-w-[350px] px-6 py-4 flex flex-col gap-10 shadow-lg`}>
      <div className="mt-5 flex flex-col gap-3 px-5 rounded-lg shadow-md py-6 bg-slate-200">
        <div className="flex gap-5">
          <img
            src="/assets/icons/profile-placeholder.svg"
            className="w-14 h-14 object-contain"
          />
          <div className="flex flex-col">
            <p className="text-xl font-semibold line-clamp-1 text-ellipsis break-all">{currentUser?.fullname}</p>
            <p className="text-gray-2 line-clamp-1 text-ellipsis break-all">{currentUser?.email}</p>
          </div>
        </div>
        <button 
          className="bg-primary-500 py-2 shadow-sm text-light-1 rounded-md"
          onClick={() => {handleLogout(); setShowLeftSideBar(false);}}
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
                onClick={() => {getMessages(conversationId, member);}}
              >
                <img 
                  src={member.image? member.image : "/assets/icons/profile-placeholder.svg"} 
                  className="w-10 h-10 object-contain" 
                />
                <div className="flex flex-col">
                  <p className="text-lg font-semibold line-clamp-1 text-ellipsis break-all">{member.fullname}</p>
                  <p className="text-sm text-gray-2 line-clamp-1 text-ellipsis break-all">{member.email}</p>
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
