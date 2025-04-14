'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useOverdueStore } from '@/hooks/useOverduState';
import { cn } from '@/lib/utils';
import { useQueueStore } from '@/hooks/use-QueueState';
import { SafeUser } from "@/app/types";
import { useCompletedTaskStore } from '@/hooks/use-CompletedTaskState';
import { useInverseStore } from '@/hooks/use-inverseState';
import useIsMobile from '@/app/hooks/isMobile';
import { toast } from 'sonner';
import { uselistStore } from '@/hooks/use-listState';
import { Button } from '@/components/ui/button';
import { useAction } from '@/hooks/use-action';
import { updateUser } from '@/actions/update-user';
interface NavbarProps {
  currentUser?: SafeUser | null;
}

const Search: React.FC<NavbarProps> = ({
  currentUser,
}) => {
  const params = useSearchParams();
  const path = usePathname();
  const {overdueState, setOverdueState}= useOverdueStore();
  const {recentQ, setRecentQueueState}= useQueueStore();
  const {completedTasks, setCompletedTaskState}= useCompletedTaskStore();
  const {inverseState ,setInverseState}= useInverseStore();
  const {listState ,setListState}= uselistStore();
  
  const [isloading, setIsLoading]=useState(true);
  const router = useRouter();

  useEffect(() => {
    
  setInverseState(currentUser?.toggleInverse||false)
  setRecentQueueState(currentUser?.toggleRecentTaskorAll||false)
  setCompletedTaskState(currentUser?.togglePendingTasksOrAll||false)
  setListState(currentUser?.emptyListShow||false)
  setOverdueState(currentUser?.toggleOverdueorAll||false)
  }, []); // Empty dependency array ensures fetching on mount

  const isMobile =  useIsMobile();

  
  const { execute, fieldErrors } = useAction(updateUser, {
    onSuccess: (data) => {
       // toast.success(`My profile ${data.name}  email: ${data.email} updated successfully: `);
    
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const HideStateHandler =()=>{    
    execute({
      id: currentUser?.id ||'056541!`232',
      notificationToaster:false
    })
  }

  
  useEffect(()=>{
   const timeoutID = setTimeout(() => {
     setIsLoading(false);//flash end half a second
   }, 2000);
   return () => clearTimeout(timeoutID);

  },[])

  const prefStateHandler =()=>{
    // console.log('mapstate',mapState)
    if(path == '/preference'){
      router.replace('/')
    
    }else{
      router.replace('/preference')
    }
   
  }
  
  const overdueStateHandler =()=>{
    setOverdueState(!overdueState);
  }
  
  const recentQueueStateHandler =()=>{
    setRecentQueueState(!recentQ);
  }
  const completedTasksStateHandler =()=>{
    setCompletedTaskState(!completedTasks);
  }

  const inverseStateHandler =()=>{
    setInverseState(!inverseState);
  }
  const listStateHandler =()=>{
    setListState(!listState);
  }
  useEffect(()=>{
    if (isMobile==true && currentUser?.notificationToaster==true){
       toast.success(<span className="font-semibold text-[12px]"> {completedTasks?<span className='underline text-red-800'>{inverseState?'Completed-Tasks':`Pending-Tasks`}</span>:'ALL-Tasks'}
       {',  '}{recentQ ?<span className='underline text-red-800'>{inverseState?'Old-Addition':`Recent-Addition`}{` ${currentUser?.recentDays}`}</span>:'ALL-Addition'}
       {',  '}{overdueState?<span className='underline text-red-800'>{inverseState?'Non-Overdue':'OverDue'}</span>:'All-Time'} 
       {',  '}{listState?<span className='underline text-red-800'>{'Lists-ON'}</span>:'Lists-OFF'}
       {',  '}<Button onClick ={HideStateHandler} className="h-auto w-auto px-1 text-green-700 text-[12px]" variant="outline">Hide</Button>
      </span> )
    }
  },[recentQ,inverseState,completedTasks,overdueState,listState])
  return ( 
    <div
     
      className="
        w-full 
        md:w-auto 
        py-2 
        rounded-full 
        transition 
        cursor-pointer
      "
      >
        <div 
          className="
            flex 
            flex-row 
            items-center 
            justify-between
          "
          >
            <div 
              className="
                text-sm 
                font-semibold 
                px-2
                md:px-0
              "
            >
              
                    {/* <div className='p-6 px-10 flex justify-between shadow-sm fixed top-0 w-full z-10 bg-white'> */}
                    <div className='flex gap-3 items-center'>
                      {
                      isloading==false?
                      (
                        <div className='flex gap-1'>
                          <Image 
                            src={completedTasks==true?'/taskAA.svg':'/taskBB.svg'} 
                            width={35}
                            height={35} alt='map' 
                            className={cn("h-auto ", completedTasks==true?'border bg-gray-100':'' )}                      
                            onClick={completedTasksStateHandler}
                          />
                  
                          <Image 
                            src={recentQ==true?'/addA.svg':'/addB.svg'} 
                            width={35}
                            height={35} alt='map' 
                            className={cn("h-auto ", recentQ==true?'border bg-gray-100':'' )}                      
                            onClick={recentQueueStateHandler}
                          />
                  
                          <Image 
                            src={overdueState==true?'/timerA.svg':'/timerB.svg'} 
                            width={35}
                            height={35} alt='overdue' 
                            className={cn("h-auto  ",overdueState==true?'border bg-gray-100':'' )}                      
                            onClick={overdueStateHandler}
                          />
                          <Image 
                            src={inverseState==true?'/invertedA.svg':'/invertedB.svg'} 
                            width={35}
                            height={35} alt='inverse' 
                            className={cn("h-auto  ",inverseState==true?'border bg-gray-100':'' )}                      
                            onClick={inverseStateHandler}
                          />
                          <Image 
                            src={listState==true?'/lstA.svg':'/lstB.svg'} 
                            width={35}
                            height={35} alt='list' 
                            className={cn("h-auto  ",listState==true?'border bg-gray-100':'' )}                      
                            onClick={listStateHandler}
                          />
                       
                          <Image 
                              src={path == '/preference'?'/star2.svg':'/star.svg'} 
                              width={35}
                              height={35} alt='likes' 
                              className={cn("h-auto ",path == '/preference'?'border bg-gray-100':'' )}  
                              onClick={prefStateHandler}
                                              
                          />
                      
                        </div>
                      )
                      :
                        (
                          <div className='flex gap-1'>
                            {
                              [1,2,3,4,5].map((item,index)=>(
                                <div key={index} 
                                    className={cn("w-[35px]  bg-slate-200 animate-pulse rounded-lg h-[30px] ")}
                                >
                                </div>
                              ))
                            }
                          </div>
                        )
                    
                    }
                      <ul className='hidden md:flex gap-2'>
                          {
                            isloading==false?
                            (
                              <>
                                <li className='hover:text-primary font-medium text-sm cursor-pointer' >
                                  {completedTasks?<span className='underline text-red-800'>{inverseState?'Completed-Tasks':`Pending-Tasks`}</span>:'ALL-Tasks'}
                                  {',  '}{recentQ ?<span className='underline text-red-800'>{inverseState?'Old-Addition':`Recent-Addition`}{` ${currentUser?.recentDays}`}</span>:'ALL-Addition'}
                                  {',  '}{overdueState?<span className='underline text-red-800'>{inverseState?'Non-Overdue':'OverDue'}</span>:'All-Time'}
                                  {',  '}{listState?<span className='underline text-red-800'>{'Lists-ON'}</span>:'Lists-OFF'}
                              
                                  {path == '/preference'?<span className='underline text-red-800'>Preference</span>:''}
                                </li>
                              </>
                            )
                            :
                            (
                              <div className='hidden md:flex gap-1'>
                                <div  className={cn("w-[150px]  bg-slate-200 animate-pulse rounded-lg h-[30px] ")}>
                                </div>
                                <div  className={cn("w-[100px]  bg-slate-200 animate-pulse rounded-lg h-[30px] ")}>
                                </div>
                              </div>
                            )
                          }
                      </ul>
                    </div>
                  
            </div>
          </div>
    </div>
  );
}
 
export default Search;