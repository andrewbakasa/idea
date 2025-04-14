'use client';
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SafeBoard, SafeUser } from "../types";
import Heading from "../components/Heading";
import Search from "../components/Search";
import Container from "../components/Container";
import Link from "next/link";
import { FormPopover } from "../components/form/form-popover";
import { Hint } from "../components/hint";
import { HelpCircle } from "lucide-react";
import PrivacyButton from "../components/PrivacyButton";
import { redirect } from "next/navigation";
import { useWindowSize } from "@/hooks/use-screenWidth";
import ProgressBar from "@ramonak/react-progress-bar";
import Cookies from 'js-cookie';
import SaveExcelMutliple from "../components/SaveExcelMultiple";
import { areDatesSimilar, cn, getCardsFromSafeBoard, getColorFromPercent, getDateTodayYesterdayORFormatedDate, 
         getLatestCard, isNumber, sortDates } from "@/lib/utils";
import ReactPaginate from "react-paginate";
import TanStackTable from "../components/TanstackTable";
import { getTextFromEditor3} from "@/components/modals/card-modal/description";
import { createColumnHelper } from "@tanstack/react-table";
import useIsMobile from "../hooks/isMobile";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
// import moment from "moment";
import { toast } from "sonner";
import { CompositeDecorator, DraftDecorator, Editor, EditorState } from "draft-js";
import { differenceInDays, format, isValid } from "date-fns";
import { useAction } from "@/hooks/use-action";
import { updatePagSize } from "@/actions/update-user-pagesize";
import { useOverdueStore } from "@/hooks/useOverduState";
import { useQueueStore } from "@/hooks/use-QueueState";
import { useCompletedTaskStore } from "@/hooks/use-CompletedTaskState";
import { useInverseStore } from "@/hooks/use-inverseState";
import { uselistStore } from "@/hooks/use-listState";
import moment from "moment";
import CreatedAtUpdatedAt from "./updatedCreated";
import { useCardReadModeStore } from "@/hooks/use-cardReadMode";

interface ProjectsClientProps {
  boards: SafeBoard[],
  currentUser?: SafeUser | null,
  origin: string
}
interface Highlight {
  text: string;
  color: string; // Optional: Customize highlight color
}

export function getFinalStatement(data:any){
  const today = new Date();
  // const formattedDDate =data?.dueDate? format(data?.dueDate||today, 'EEE dd MMMM yyyy'):""; // Customize format as needed
  const daysLeft = data?.dueDate? differenceInDays(data?.dueDate, today):-1;
  const daysAheadofSchedule = data?.dueDate? differenceInDays(data?.dueDate, data?.completedDate):-1;
  
  const overDuestate = data?.dueDate? daysLeft>0?"left":"overdue":"NULL"
  const dayOrDays =Math.abs(daysLeft)==1? 'day': 'days'
  let clapHands=''
  if (daysLeft>0){clapHands='👏'}
  if (daysAheadofSchedule>=0){clapHands='👏👏👏'}
  // const finalStatement =data?.dueDate?data.progress=='complete'?"Completed" :`[${Math.abs(daysLeft)} ${dayOrDays} ${overDuestate}]`:"N/A"
  const finalStatement =data?.progress=='complete'?`✅Completed ${clapHands}` :data?.dueDate?`[${Math.abs(daysLeft)} ${dayOrDays} ${overDuestate}]`:"N/A"
  return finalStatement
}

const ProjectsClient: React.FC<ProjectsClientProps> = ({
              boards,
              currentUser,
              origin
            }) => {

  let recentDays=currentUser?.recentDays?currentUser.recentDays:7 
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(''); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBoards, setFilteredBoards] = useState(boards);
  const [pageSize, setPageSize] = useState<number>(currentUser? currentUser.pageSize:8); // Adjust as needed
  const [pageCount, setPageCount] = useState(8); // Adjust as needed
  const [itemOffset, setItemOffset] = useState(0);
  const isMobile =  useIsMobile();
  const [fList,setFList]=useState(boards);
  const [fListPage,setFListPage]=useState(boards);
  const [compositeDecorator,setCompositeDecorator] = useState(new CompositeDecorator([]))
  const {overdueState}= useOverdueStore();
  const {recentQ}= useQueueStore();
  const {inverseState}= useInverseStore();
  const {completedTasks} =useCompletedTaskStore();
  const {listState }= uselistStore();

  
  // const {readMode,setReadModeState}= useCardReadModeStore();
  //set current 
  // setReadModeState(currentUser?.cardReadMode||true)
 
  const { execute, fieldErrors } = useAction(updatePagSize, {
    onSuccess: (data) => {
      toast.success(`PageSize for ${data.email} updated to ${data.pageSize}`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });  
let personalColor='text-orange-100';
let personalBgColor='bg-sky-100';
const columnHelper = createColumnHelper<SafeBoard>()

const columns = [  
  
  columnHelper.accessor('imageThumbUrl', {
    cell: (info) =>{
        const id=info?.table.getRow(info.row.id).original.id 
        const pbc= info?.table.getRow(info.row.id).original.public         
        const userId= info?.table.getRow(info.row.id).original.userId         
        const title=info?.table.getRow(info.row.id).original.title;
        const percent=info?.table.getRow(info.row.id).original.percent ;
        const board =info?.table.getRow(info.row.id).original
        // get latest card or the first card
        const subtitle=getLatestCard(getCardsFromSafeBoard(board))?.title?? board?.lists[0]?.cards[0]
     
    
     return ( 
      <Link
      key={id}
      href={`/board/${id}`}
      className=""
      >
  
          <div 
              className="flex flex-col bg-no-repeat bg-cover bg-center rounded-sm"
              style={{ backgroundImage: `url(${info?.getValue()})` }}
          >
              <div className="flex  gap-1">
                <Link
                  key={id}
                  href={`/board/${id}`}
                  className=""
                >
                  <img
                      src={info?.getValue()}
                      alt={'...'}
                      className="rounded-full w-10 h-10 object-cover"
                    />
                </Link>
                <span className="mr-0 text-lg">{title}</span>
              </div>
              <div className="mt-1 flex flex-row gap-1">
                  <div 
                    className="w-[150px]"
                  >
                        <ProgressBar 
                            isLabelVisible={false}  
                            bgColor={getColorFromPercent(Number(percent))}  
                            completed={Number(percent)} 
                        />
                  </div>
                  <span>{`${percent}%`}</span>
                  {/* {currentUser?.id == userId 
                      && <PrivacyButton 
                              boardId={id}
                              currentState={pbc} 
                              currentUser={currentUser}
                    /> 
                  } */}

              </div>
              <ul>
                <li>
                  <span className="text-sm font-mono bold">{subtitle}</span>
                </li>
              </ul>
              
          </div>
      </Link>
     )
    },
        header: "Title",
  }),
  
  
  columnHelper.accessor("percent", {
    cell: (info) => {
      //  console.log('id', info?.table.getRow(info.row.id).original)
      const id=info?.table.getRow(info.row.id).original.id 
      const pbc= info?.table.getRow(info.row.id).original.public         
      const userId= info?.table.getRow(info.row.id).original.userId         
      const board= info?.table.getRow(info.row.id).original
      // get latest card or the first card
      const x=getLatestCard(getCardsFromSafeBoard(board))?? board?.lists[0]?.cards[0]
      const created=x? x.createdAt:info?.table.getRow(info.row.id).original.createdAt
      const updated=x? x.updatedAt:info?.table.getRow(info.row.id).original.updatedAt;
      const notSameDate = moment(created).fromNow()!== moment(updated).fromNow()
      // areDatesSimilar(created,updated,1);
     return ( 
      
      <div className="flex flex-col">
        <div className="flex justify-between">
            <div className="flex gap-1">
                <span className='flex gap-2 text-sm text-red-200 '>Due-Status:</span> 
                <span className='flex gap-2 text-sm text-red-200 '>{getFinalStatement(x)}</span> 
            </div>
            <div className="flex gap-1">
              <span className='flex gap-2 text-sm text-red-200 '>{'cre: '} {moment(created).fromNow() }</span>
              {notSameDate && <span className='flex gap-2 text-sm text-red-200 '>{'upd: '} {moment(updated).fromNow() }</span>}
              {currentUser?.id == userId 
                  && <PrivacyButton 
                          boardId={id}
                          currentState={pbc} 
                          currentUser={currentUser}
                /> 
              }

            </div>
        </div>        
        <div 
              className={cn(
                "static-editor max-h-[50vh] overflow-x-hidden ",
              )}
          >
              <Editor 
                editorState={EditorState.createWithContent(getTextFromEditor3(x),compositeDecorator)} 
                readOnly 
                onChange={() => {}} // Empty dummy function
              />
          </div>
    </div>
  
    )

  },
    header: "Description",
  }),                           
  
   
]

// Assuming you have functions for truncation and formatting
function truncateString(text: string, maxLength: number): string {
  // Implement your truncation logic here
  return text.slice(0, maxLength) + (text.length > maxLength ? "..." : "");
}

function NumberFormatter(value: number): string {
  // Implement your formatting logic here (e.g., comma separators, decimals)
  return value.toFixed(2); // Example formatting to two decimal places
}
  Cookies.set('originString', origin)  
  useEffect(() => {
    if (searchTerm !== "") {
      let arrFirst =searchTerm.split(';');
      const arr = arrFirst.filter(element => element);  // Using arrow function (ES6)

      const results = boards.filter((board) =>
          (
            arr.some(
              (x)=>
                (
                  x.split(',').every((s)=>(board.title.toLowerCase().includes(s.trim().toLowerCase())))
                )
            )
          
           ||
             //Search Card Title
            board.lists.some(
              ( x_list)=>(
                     (
                        arr.some(
                          (x)=>
                            (
                              x.split(',').every((s)=>(x_list.title.toLowerCase().includes(s.trim().toLowerCase())))
                            )
                        )

                        ||

                        x_list.cards.some(
                          ( x_card)=>(
                            //Search Card Title
                            arr.some(
                              (x)=>
                                (
                                  x.split(',').every((s)=>(x_card.title.toLowerCase().includes(s.trim().toLowerCase())))
                                  ||
                                  x.split(',').every((s)=>(x_card.description?.toLowerCase().includes(s.trim().toLowerCase())))
                              
                                )
                            )
                          
                          )// Return clossing bracket
                        )
                      )
                  // )
              )// Return clossing bracket
            )
          )
      
       
      );
      setFilteredBoards(results);
      // setFilteredListPage(results)
    } else {
      setFilteredBoards(boards);
    }
  }, [boards]);
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const { width, height } = useWindowSize();
  const mobileWidth =400

 let allowedRoles:String[]
 allowedRoles=['employee','admin','visitor', 'manager']
 const isAllowedAccess = currentUser?.roles.filter((role) =>
                                          (//Outer bracket ::forEach user role  
                                              //Search Card  within the List
                                              allowedRoles.some((y)=>(// Allowed Roles
                                                  //Search Card Title
                                                  y.toLowerCase().includes(role.toLowerCase())
                                                  
                                                )// Return clossing bracket
                                              )
                                        )// Out bracker
                                    ) 
const popover_content_pos =width?width<mobileWidth?'bottom':'right':'right'
let title_ =  `Personal Projects ${fList.length} of ${boards.length}`
let subtitle_="Projects boards created by you" //"Manage your projects and teams online"

if (origin!=='myprojects'){
  title_ =  `Projects ${fList.length} of ${boards.length}`
  subtitle_="Available Projects"
  }       
 /* ----------------Pagination------------ */
 type PageSizeOption = '1' | '2' | '3' | '4' | '8' | '16' | '24' | '32' | '48' | '60'; // Define valid page size options
 
const handlePageSizeChange = (newPageSize: PageSizeOption) => {
   // Type assertion (optional, but can improve type safety):
   const numericPageSize = parseInt(newPageSize, 10);
   setPageSize(numericPageSize);
   if (currentUser){
        execute({
          id: currentUser?.id,
          pageSize:numericPageSize
        })
  }  
   setItemOffset(Math.min(numericPageSize, Math.ceil(fList?.length / pageSize)));
};
 

 const handlePageClick = (event: { selected: number }) => {
   const newOffset = (event.selected * pageSize) % fList.length;
   setItemOffset(newOffset);
 };
 
 const calculatePageSlice = (fList?: SafeBoard[], itemOffset?: number, pageSize?: number): SafeBoard[] | undefined => {
   if (!fList|| !pageSize) {
     return undefined;
   }
   const endpoint = Math.min(itemOffset! + pageSize!, fList.length);
   return fList.slice(itemOffset!, endpoint);
 };
 
 useEffect(() => {
   const pageSlice = calculatePageSlice(fList, itemOffset, pageSize);
   if (pageSlice) {
     setFListPage(pageSlice);
   }
 }, [itemOffset, fList, pageSize]);
 
 useEffect(() => {
   if (fList && pageSize) {
     const newPageCount = Math.ceil(fList.length / pageSize);
     if (pageCount !== newPageCount) {
       setPageCount(newPageCount);
     } else {
       // Search filter catalog logic
       if (itemOffset > pageSize) {
         setItemOffset(0);
       }
     }
   } else {
     if (itemOffset > pageSize) {
       setItemOffset(0);
     }
   }
 }, [fList, pageSize]);
 
 useEffect(() => {
   setItemOffset(0);
 }, [pageCount]); 
 
  const renderPaginationButtons = () => {
   const buttons = [];    
   buttons.push(
       <ReactPaginate
               breakLabel="..."
               // nextLabel="next >"
               containerClassName="shadow border pagination text-lg text-blue-500 justify-center mt-4 flex flex-row gap-2" // Tailwind CSS classes
               activeClassName="active bg-orange-300 text-white" // Tailwind CSS classes
               previousLabel="«"
               nextLabel="»"
   
               onPageChange={handlePageClick}
               pageRangeDisplayed={5}
               pageCount={Math.ceil(isNumber(fList?.length/pageSize)?fList?.length/pageSize:0)}
             
               // previousLabel="< previous"
               renderOnZeroPageCount={null}
       />
   );
   buttons.push(
       <select 
           className='border-gray-300 rounded border text-rose-500' 
           value={pageSize} 
           onChange={(e) => handlePageSizeChange(e.target.value as PageSizeOption)}
       >
           <option value="1">1 per Page</option>
           <option value="2">2 per Page</option>
           <option value="3">3 per Page</option>
           <option value="4">4 per Page</option>
           <option value="8">8 per Page</option>
           <option value="16">16 per Page</option>
           <option value="24">24 per Page</option>
           <option value="32">32 per Page</option>
           <option value="48">48 per Page</option>
           <option value="60">60 per Page</option>
       </select>
 
   );
   return <div className="flex justify-center gap-3">{buttons}</div>;
 };
 
useEffect(() => {
  if (fList && pageSize) {
    const newPageCount = Math.ceil(fList.length / pageSize);
    if (pageCount !== newPageCount) {
      setPageCount(newPageCount);
    } else {
      // Search filter catalog logic
      if (itemOffset > pageSize) {
        setItemOffset(0);
      }
    }
  } else {
    if (itemOffset > pageSize) {
      setItemOffset(0);
    }
  }
}, [fList, pageSize]);

useEffect(() => {
  setItemOffset(0);
}, [pageCount]);

useEffect(()=>{  
  let boardListFilterCard: SafeBoard[];
  let arrFirst =searchTerm.split(';');
  const arr = arrFirst.filter(element => element);  // Using arrow function (ES6)
  if (searchTerm !== "") {
    let boardListCardOverdue = filteredBoards.map((board) => ({
      ...board,
      //Change lists
      lists:board.lists.map((list)=>({
          ...list,
          //filter cards belonging to list
          cards: list.cards.filter((card)=>{
           let overdueBooleen=true;
           //A:Overdue or all
           //B: Non overdue or ALL
           if (inverseState==true){
             if (overdueState==true){
               const today = new Date();             
               const daysLeft = card?.dueDate? differenceInDays(card?.dueDate, today):1;
               const pending_ =card?.progress?card.progress=='complete'?false:true:false
               if ((daysLeft < 0) && pending_==true) {
                   //.....overdue
                   overdueBooleen=false;
               }else{
                 // not overdue
                  overdueBooleen=true;
               }
             }
         
           }else{
             if (overdueState==true){
               /* 1....Due Date variables    Yes✓    False
                  2. ...Due date pass        True✓   False
                  3. ...Progress variable    Yes✓     NO
                  4..... Progress Not complete True✓   False
                  5.   Overdue== 1&2&3&4
                  6  if overdue return true other return false
               */
               const today = new Date(); 
               //diffenceInDay(LaterDate, today)   >> 0 , negative == overdue        
               const daysLeft = card?.dueDate? differenceInDays(card?.dueDate, today):1;
               const pending_ =card?.progress?card.progress=='complete'?false:true:false
               if ((daysLeft < 0) && pending_==true) {
                   //.....overdue
                   overdueBooleen=true;
               }else{
                 // not overdue
                  overdueBooleen=false;
               }
             }
           }

           let recentQBooleen=true;
           // A: get all recent cards or All cards
           // B: gell all old cards or All cards
           if (recentQ==true){
             const today = new Date();             
             const dateA = new Date(card.updatedAt);
             const daysLeft =  differenceInDays(dateA, today)
             if (inverseState==true){
               if (daysLeft <  -recentDays)  {
                 recentQBooleen=true;
               }else{
                 recentQBooleen=false
               }

             }else{
               if (daysLeft >  -recentDays)  {
                 recentQBooleen=true;
               }else{
                 recentQBooleen=false
               }
             }
           }

           let taskBoolean=true;
           //filter out completed tasks and those without tages
           //A: completed tasks or ALL
           //B: uncomplted tasks or ALL
           if (inverseState==true){
             if (completedTasks==true){
               //B state
               const CompleteStatus =card?.progress?card.progress=='complete'?true:false:false
               if (CompleteStatus ==false)  {
                 //remove all that are uncompleted
                 taskBoolean=false;
               }
             }
           }else{
             if (completedTasks==true){
               const completeStatus =card?.progress?card.progress=='complete'?true:false:true
               if (completeStatus ==true)  {
                 //remove allbthatvare completed
                 taskBoolean=false;
               }
             }
           }
            
             return ( card.active && overdueBooleen && recentQBooleen && taskBoolean)
           
          })
      })
      ),
     }));
     //removes the cards that dont fall inside
     boardListCardOverdue= boardListCardOverdue.filter((board) => (board.lists.length>0))
  
     // Keep board that meet criteria
      const keepBoardMeetingCriterion = boardListCardOverdue.filter((board) =>
          ( // Board Title
            arr.some(
              (x)=>
                (
                  x.split(',').every((s)=>(board.title.toLowerCase().includes(s.trim().toLowerCase())))
                )
            )
          
           ||
            //Keep board with  list title, or card title or card description that meet condition
            board.lists.some(
              ( x_list)=>(
                     (// List Title
                        arr.some(
                          (x)=>
                            (
                              x.split(',').every((s)=>(x_list.title.toLowerCase().includes(s.trim().toLowerCase())))
                            )
                        )

                        ||

                        x_list.cards.some(
                          ( x_card)=>(
                            //Search Card Title or card description
                            arr.some(
                              (x)=>
                                (
                                  x.split(',').every((s)=>(x_card.title.toLowerCase().includes(s.trim().toLowerCase())))
                                  ||
                                  x.split(',').every((s)=>(x_card.description?.toLowerCase().includes(s.trim().toLowerCase())))
                              
                                )
                            )
                          
                          )// Return clossing bracket
                        )
                      )
                  // )
              )// Return clossing bracket
            )
          )
       
      );
      // keep list that meet criterion
      const boardFilterList = keepBoardMeetingCriterion.map((board) => ({
        ...board,
        //Change lists
        lists:board.lists.filter((list)=>
            (
              (
                  arr.some(
                    (x)=>
                    (
                      x.split(',').every((s)=>(list.title.toLowerCase().includes(s.trim().toLowerCase())))
                  
                    )
                  )
                
                  ||

                  //Search Card Title
                  list.cards.some(
                    ( x_card)=>(
                        arr.some(
                          (x)=>
                          (
                            x.split(',').every((s)=>(x_card.title.toLowerCase().includes(s.trim().toLowerCase())))
                            ||
                            x.split(',').every((s)=>(x_card.description?.toLowerCase().includes(s.trim().toLowerCase())))
                
                          )
                        )
                    )// Return clossing bracket
                  )
              )  
            )
        )
      })
      );
       // keep cards tha meet criterion.
      boardListFilterCard = boardFilterList.map((board) => ({
        ...board,
        //Change lists
        lists:board.lists.map((list)=>({
          ...list,
          //filter cards belonging to list
          cards: list.cards.filter((card)=>
            (
              //Search Card Title
              arr.some(
                (x)=>
                (
                  x.split(',').every((s)=>(card.title.toLowerCase().includes(s.trim().toLowerCase())))
                    ||
                  x.split(',').every((s)=>(card.description?.toLowerCase().includes(s.trim().toLowerCase())))
        
                )
              )
          

            )
          )
        })
        ),
      })
      );
    
      const boardListCardFinal= boardListFilterCard.map((board) => ({
        ...board,
        //remov empty list
        lists:board.lists.filter((list)=>( list.cards.length>0)),
       }));
          
          if (listState==true){
            setFList(sortDates(boardListCardFinal));
          }else{
            const boardListCardFinal2= boardListCardFinal.filter((board) => (board.lists.length>0))
            setFList(sortDates(boardListCardFinal2));
          } 
   
  } else {
      const boardListCardOverdue = filteredBoards.map((board) => ({
       ...board,
       //Change lists
       lists:board.lists.map((list)=>({
           ...list,
           //filter cards belonging to list
           cards: list.cards.filter((card)=>{

            let overdueBooleen=true;
            //A:Overdue or all
            //B: Non overdue or ALL
            if (inverseState==true){
              if (overdueState==true){
                // all those that are not overdue
                const today = new Date();             
                const daysLeft = card?.dueDate? differenceInDays(card?.dueDate, today):1;
                const pending_ =card?.progress?card.progress=='complete'?false:true:false
                if ((daysLeft < 0) && pending_==true) {
                    //.....overdue
                    overdueBooleen=false;
                }else{
                  // not overdue
                   overdueBooleen=true;
                }
              }
          
            }else{
              if (overdueState==true){
                /* 1....Due Date variables    Yes✓    False
                   2. ...Due date pass        True✓   False
                   3. ...Progress variable    Yes✓     NO
                   4..... Progress Not complete True✓   False
                   5.   Overdue== 1&2&3&4
                   6  if overdue return true other return false
                */
                const today = new Date(); 
                //diffenceInDay(LaterDate, today)   >> 0 , negative == overdue        
                const daysLeft = card?.dueDate? differenceInDays(card?.dueDate, today):1;
                const pending_ =card?.progress?card.progress=='complete'?false:true:false
                if ((daysLeft < 0) && pending_==true) {
                    //.....overdue
                    overdueBooleen=true;
                }else{
                  // not overdue
                   overdueBooleen=false;
                }
              }
            }
          
            let recentQBooleen=true;
            // A: get all recent cards or All cards
            // B: gell all old cards or All cards
            if (recentQ==true){
              const today = new Date();             
              const dateA = new Date(card.updatedAt);
              const daysLeft =  differenceInDays(dateA, today)
              if (inverseState==true){
                if (daysLeft <  -recentDays)  {
                  recentQBooleen=true;
                }else{
                  recentQBooleen=false
                }

              }else{
                if (daysLeft >  -recentDays)  {
                  recentQBooleen=true;
                }else{
                  recentQBooleen=false
                }
              }
            }

            let taskBoolean=true;
            //filter out completed tasks and those without tages
            //A: completed tasks or ALL
            //B: uncomplted tasks or ALL
            if (inverseState==true){
              if (completedTasks==true){
                  //B state
                  const CompleteStatus =card?.progress?card.progress=='complete'?true:false:false
                  if (CompleteStatus ==false)  {
                    //remove all that are uncompleted
                    taskBoolean=false;
                  }
              }
            }else{
              if (completedTasks==true){
                const completeStatus =card?.progress?card.progress=='complete'?true:false:true
                if (completeStatus ==true)  {
                  //remove allbthatvare completed
                  taskBoolean=false;
                }
              }
            }

          
          return ( card.active && overdueBooleen && recentQBooleen && taskBoolean)
        
           })
       })),
      }));
      const boardListCardFinal= boardListCardOverdue.map((board) => ({
        ...board,
        //remov empty list
        lists:board.lists.filter((list)=>( list.cards.length>0)),
       }));
          //  keep boards which matches board title.....
    if (listState==true){
      setFList(sortDates(boardListCardFinal));
    }else{
      const boardListCardFinal2= boardListCardFinal.filter((board) => (board.lists.length>0))
      setFList(sortDates(boardListCardFinal2));
    } 

  }
},[filteredBoards,overdueState,recentQ,completedTasks, inverseState, searchTerm,listState])

useEffect(()=>{
  let arrFirst =searchTerm.split(';');
  const subLists = arrFirst.filter(element => element);  // Using arrow function (ES6)
  //Combine elements from sub-lists into a single list
  const highlightText = subLists.flatMap(subList => subList.split(','));  
  const customHighlightDecorator: DraftDecorator = {
    strategy: (block, callback, contentState) => {
      const text = block.getText();
      const currentSelection = contentState.getSelectionBefore();  
      for (let i = 0; i < highlightText.length; i++) {
        const word = highlightText[i];
        const startIndex = text.toLocaleLowerCase().indexOf(word.toLocaleLowerCase());  
        if (startIndex !== -1) {
          const endIndex = startIndex + word.length;
          // console.log('nnn', word, text)
          // Check if the highlighted word overlaps with the current selection
          const isWithinSelection = currentSelection.getStartOffset() <= startIndex &&
                                    currentSelection.getEndOffset() >= endIndex;  
          const style = isWithinSelection ? 'HIGHLIGHTED_SELECTED' : 'HIGHLIGHTED';  
          callback(startIndex, endIndex);
        }
      }
    },
  
    component: ({ children, style }) => {
      return <span style={style} className="bg-yellow-400 ">{children}</span>;
    },
    
  };
  setCompositeDecorator(new CompositeDecorator([customHighlightDecorator]));
},[searchTerm])

// Note: these aren't very good regexes, don't use them!
 if (isAllowedAccess?.length==0) return redirect('/denied') 
 if(!currentUser)return redirect('/denied')
  return (
    <Container >
     <div className="mt-[-40px] flex flex-col  sm:flex-row  justify-between sm:px-1 xs:px-2">          
        <Heading
          title={title_}
          subtitle={subtitle_} 
        />
        <div className="flex flex-row">
          <SaveExcelMutliple data={fList} disabled={false} fileName={`${origin}_${currentUser.email}_`}/>
          <Search 
              handleSearch ={handleSearch} 
              setSearchTerm={setSearchTerm} 
              searchTerm = {searchTerm}
          />  
        </div>
     </div>
     <div className="mt-1 pb-5">{/* space-y-4 pb-10*/}
        <div>
          {
            isMobile?
            ( 
              <div 
                  className={cn(
                    "grid grid-cols-2 lg:grid-cols-4 gap-4",
                    isMobile?'grid grid-cols-1':''
                  )}
                >
                  {fListPage.map((board, index) => (
                            <>
                              {
                                (
                                  <div
                                      key={index}
                                      className={cn(
                                          "p-3 hover:border hover:border-primary rounded-lg cursor-pointer",
                                          isMobile?'grid grid-cols-[5%_95%] ':'',
                                          currentUser?.id == board.userId?personalBgColor:'bg-gray-100',
                                      )}
                                  >
                                      <Link 
                                        key={board.id}
                                        href={`/board/${board.id}`}
                                          className='cursor-pointer' 
                                        >
                                          <Avatar className="h-10 w-10">
                                              <AvatarImage src={board.imageThumbUrl} />
                                          </Avatar>
                                      </Link>
                                    
                                      <div className='flex mt-2 flex-col gap-2'>
                                            <div className="flex flex-row justify-between w-full bg-no-repeat bg-cover bg-center rounded-sm" style={{ backgroundImage: `url(${board.imageThumbUrl})` }}>
                                              <Link 
                                                  key={board.id}
                                                  href={`/board/${board.id}`}
                                                    className='cursor-pointer' 
                                                  >
                                                  <h2 className={cn("text-white font-bold text-xl", isMobile?'px-7':'')}>{board?.title}</h2>
                                              </Link> 
                                              <div className='flex'>
                                                    <div className="flex flex-row">
                                                      <span className="text-white">{board.percent}%</span>
                                                    </div>
                                                    {currentUser?.id == board.userId 
                                                            && <PrivacyButton 
                                                                    boardId={board.id}
                                                                    currentState={board.public} 
                                                                    currentUser={currentUser}
                                                          /> 
                                                        }
                                              </div>
                                            </div>
                                              
                                            <div 
                                              className="w-full"

                                                // absolute
                                                // bottom-3
                                                // left-3"
                                            >
                                              <ProgressBar 
                                                  isLabelVisible={false}  
                                                  bgColor={getColorFromPercent(Number(board.percent))} 
                                                  // baseBgColor="color-inherit" 
                                                  // className="w-[70%] relative text-xs/4px text-white bg-transparent" 
                                                  completed={Number(board.percent)} 
                                              />
                                            </div>
                                           <h2 className='flex gap-2 text-sm font-bold text-gray-700 '>{getLatestCard(getCardsFromSafeBoard(board))?.title??board.lists[0]?.cards[0]?.title}</h2> 
                                            <CreatedAtUpdatedAt 
                                                createdAt={getLatestCard(getCardsFromSafeBoard(board))?.createdAt?? board.createdAt} 
                                                updatedAt={getLatestCard(getCardsFromSafeBoard(board))?.updatedAt?? board.updatedAt}/>
                                            {/* <div className="flex justify-between">
                                              <span className='flex gap-2 text-sm text-gray-700 '>{'cre '} {moment(getLatestCard(getCardsFromSafeBoard(board))?.createdAt?? board.createdAt).fromNow()}</span> 
                                              <span className='flex gap-2 text-sm text-blue-700 '>{'upd '} {moment(getLatestCard(getCardsFromSafeBoard(board))?.updatedAt?? board.updatedAt).fromNow()}</span> 
                                            </div>
                                                                   */}
                                            <div 
                                                className={cn(
                                                  "static-editor max-h-[50vh] overflow-x-hidden shadow border",
                                                  // cardYscroll? "overflow-y-auto" : "overflow-y-hidden" 
                                                )}
                                            >

                                              <div className="flex flex-col">
                                                <div className="flex gap-1">
                                                  <span className='flex gap-2 text-sm text-red-700 '>Due-Status:</span> 
                                                  <span className='flex gap-2 text-sm text-red-700 '>{getFinalStatement(getLatestCard(getCardsFromSafeBoard(board))??board?.lists[0]?.cards[0])}</span> 
                                                </div>         
                              
                                                <Editor 
                                                  editorState={EditorState.createWithContent(getTextFromEditor3(getLatestCard(getCardsFromSafeBoard(board))??board?.lists[0]?.cards[0]),compositeDecorator)} 
                                                  readOnly 
                                                  onChange={() => {}} // Empty dummy function
                                                />
                                              </div>
                                            </div>          
                                      </div>
                                  </div>           
                                )
                                }
                            </>
                    ))}
                  <FormPopover sideOffset={isMobile?-125:10} side={popover_content_pos }>
                    <div
                      role="button"
                      className="aspect-video relative h-[75px] w-[200px] bg-muted rounded-sm flex flex-col gap-y-1 items-center justify-center hover:opacity-75 transition"
                    >
                      <p className="text-sm">Create new project board</p>
                      <span className="text-xs"></span>
                      <Hint
                        sideOffset={40}
                        description={`
                          Create Workspaces here. Its unlimited boards for this workspace.
                        `}
                      >
                        <HelpCircle
                          className="absolute bottom-2 right-2 h-[14px] w-[14px]"
                        />
                      </Hint>
                    </div>
                  </FormPopover>
                  <div>
                      {fList && fList.length > 0 && ( 
                          <div className="mt-4  max-w-9 flex flex-wrap  gap-1">{renderPaginationButtons()}
                                
                          </div> 
                        )} 
                      {!fList && <p>Loading data...</p>} 
                        
                  </div>
              </div>
            )
            :
            (
              <>
                <TanStackTable  
                    data={fList} columns={columns} 
                    userPageSize={Number(pageSize)} 
                    currentUser={currentUser}
                    setPageSize= {setPageSize}
                /> 
                <FormPopover sideOffset={10} side={popover_content_pos }>
                    <div
                      role="button"
                      className="aspect-video relative h-[75px] w-[200px] bg-muted rounded-sm flex flex-col gap-y-1 items-center justify-center hover:opacity-75 transition"
                    >
                      <p className="text-sm">Create new project board</p>
                      <span className="text-xs"></span>
                      <Hint
                        sideOffset={40}
                        description={`
                          Create Workspaces here. Its unlimited boards for this workspace.
                        `}
                      >
                        <HelpCircle
                          className="absolute bottom-2 right-2 h-[14px] w-[14px]"
                        />
                      </Hint>
                    </div>
                </FormPopover>
              </>    
            ) 

          }      
        </div>
     </div>  
    </Container>
   );
}
 
export default ProjectsClient;


