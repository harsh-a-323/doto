import { signIn, signOut, useSession } from "next-auth/react"

export default function Navbar({setTaskoverlay} : { setTaskoverlay: (displayOverlay: boolean) => void}){
  const session = useSession();
//   console.log("sess : ",session);
    return (
        <div className="min-w-full border-b border-gray-300 flex h-16 justify-between items-center px-10">
            <div className="text-4xl font-light text-gray-600 hover:scale-102 transition delay-100 duration-200 ease-in-out">
                DoTo
            </div>
            <div className="flex gap-5 lg:gap-10">
                <button className="rounded-lg flex gap-3 bg-white p-2 hover:scale-105 transition delay-50 duration-200 ease-in-out hover:text-blue-600"
                onClick={()=>{setTaskoverlay(true)}}>
                    <AddSVG className="size-10"/>
                    Add new Task
                </button>
                {(session.status == "authenticated") ?  <button className="rounded-lg flex gap-3 bg-white p-2 hover:scale-105 transition delay-100 duration-200 ease-in-out hover:text-red-600"
                onClick={()=>{
                    signOut();
                }}
                >
                    Logout
                </button> :
                <button className="rounded-lg flex gap-3 bg-white p-2 hover:scale-105 transition delay-100 duration-200 ease-in-out hover:text-red-600"
                onClick={()=>{
                    signIn();
                }}
                >
                    Login
                </button>  }
            </div>
        </div>

    )
}

function AddSVG({ className }:{className : string}){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>

    )
}


