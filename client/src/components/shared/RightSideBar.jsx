import React from 'react'

const RightSideBar = ({showRightSideBar, users, getMessages }) => {
  return (
    <div className={`max-lg:${showRightSideBar? 'absolute flex top-0 left-0 w-[95%]' : 'hidden'} w-1/4 max-w-[350px] shadow-lg h-full lg:flex flex-col px-6 py-4 gap-8`}>
      <p className="mt-5 text-primary-500">People</p>

      {users.length===0? (
        <div className="flex flex-col gap-6 h-[10%] pb-2 flex-grow text-gray-1 justify-center items-center">
          No users found
        </div>
      ) : (
        <div className="flex flex-col gap-6 overflow-auto h-[10%] pb-2 flex-grow">
          {users.map((user) => (
            <div
              className="flex bg-stone-200 gap-4 items-center rounded-lg shadow-md py-3 px-4 cursor-pointer"
              key={user.id}
              onClick={() => {getMessages('new', user);}}
            >
              <img
                src={user.image? user.image : "/assets/icons/profile-placeholder.svg"} 
                className="w-10 h-10 object-contain" 
              />
              <div className="flex flex-col">
                <p className="text-lg font-semibold line-clamp-1 text-ellipsis break-all">{user.fullname}</p>
                <p className="text-sm text-gray-2 line-clamp-1 text-ellipsis break-all">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RightSideBar