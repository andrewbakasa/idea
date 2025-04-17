'use client';
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SafeAsset, SafeBoard, SafeUser } from "../types";
import Heading from "../components/Heading";
import Search from "../components/Search";
import Container from "../components/Container";
import { redirect } from "next/navigation";
import { useWindowSize } from "@/hooks/use-screenWidth";
import Cookies from 'js-cookie';
import { areDatesSimilar, cn, findLabelByValue, getCardsFromSafeBoard, getColorFromPercent, getDateTodayYesterdayORFormatedDate, 
         getLabelsAndValuesFromValues, 
         getLabelsFromValues, 
         getLatestCard, getValuesFromLabels, isNumber, sortDates } from "@/lib/utils";
import ReactPaginate from "react-paginate";
import TanStackTable from "../components/TanstackTable";
import { createColumnHelper } from "@tanstack/react-table";
import useIsMobile from "../hooks/isMobile";
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
import FilterSection, { LabelValueType } from "../components/FilterSection";
import { createTag } from "@/actions/create-tag";
import { useInverseTableStore } from "@/hooks/use-inverseTableState";
import { useShowBGImageStore } from "@/hooks/use-showBGImage";
// import { useTagLabelValueStore } from "@/hooks/use-tagLabelValue";
import { useUserLabelValueStore } from "@/hooks/use-userLabelValues";
import { PageView } from "./_components/page-view";
import { useCollapseStore } from "@/hooks/use-collapseState";
import { useShowMobileViewStore } from "@/hooks/use-mobileView";
import { Button } from "@/components/ui/button";
import { useAssetModal } from "@/hooks/use-asset-modal";
import { useAssetCatLabelValueStore } from "@/hooks/use-assetCatLabelValue";
import { useFailureCatLabelValueStore } from "@/hooks/use-failureCatLabelValue";


interface ProjectsClientProps {
  assets: SafeAsset[],
  currentUser?: SafeUser | null,
  origin: string,
  assetTagNames:any,
  failureTagNames:any,
  userNames:any
  // collapsedState?:boolean
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

const AssetsClient: React.FC<ProjectsClientProps> = ({
              assets,
              currentUser,
              origin,
              assetTagNames,
              failureTagNames,
              userNames,
             // collapsedState=false

            }) => {

  let recentDays=currentUser?.recentDays?currentUser.recentDays:7 
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(''); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredassets, setFilteredassets] = useState(assets);
  const [pageSize, setPageSize] = useState<number>(currentUser? currentUser.pageSize:8); // Adjust as needed
  const [pageCount, setPageCount] = useState(8); // Adjust as needed
  const [itemOffset, setItemOffset] = useState(0);
  const isMobile =  useIsMobile();
  const [fList,setFList]=useState(assets);
  const [fListPage,setFListPage]=useState(assets);//page display
  const [compositeDecorator,setCompositeDecorator] = useState(new CompositeDecorator([]))
  const {overdueState}= useOverdueStore();
  const {recentQ}= useQueueStore();
  const {inverseState}= useInverseStore();
  const {inverseTableState}= useInverseTableStore();

  const {completedTasks} =useCompletedTaskStore();
  const {listState }= uselistStore();
  const {showBGImage }= useShowBGImageStore();
  const  [uniqueBoardId, setUniqueBoardId]=useState('')
  
  const {collapseState}= useCollapseStore();
//state with collapse tagged project
  const [initialCollapseState, setInitialCollapsedState]=useState(origin=='taggedprojects'?collapseState:collapseState)
  const {showMobileView}=useShowMobileViewStore();
  
  const [isCollapsed, setIsCollapsed] = useState(initialCollapseState);

  
  const assetModal = useAssetModal();
  // let originalA =getLabelsAndValuesFromValues(tagNames, [])
//
const handleToggleSelectUniqueBoard = (id:string)=>{
 //filter only on
  if (uniqueBoardId?.length==0){//(filteredassets.length==1){//change logic
    //toggle to full....
    // setFilteredassets(assets)
    //clear all previous search
    setSearchTerm('')
    setUniqueBoardId(id)
    // setUniqueSelection(false)
  }else{
    //---filter only this
    // const uniqueBoard = assets?.filter(x=>(x.id==id))
    // setFilteredassets(uniqueBoard)
    setUniqueBoardId('')
  }
};

  const [category,setCategory]=useState<string>('')//x==''?null:x)//tag);
  
  const [failureCategory,setFailureCategory]=useState<string>('')//x==''?null:x)//tag);
  const {assetCatList,setAssetCatList}=useAssetCatLabelValueStore();
  const {failureCatList, setFailureCatList}=useFailureCatLabelValueStore();
  
  const {userList, setUserList}=useUserLabelValueStore();

  useEffect(() => {
   const newTagList = Array.from(assetTagNames);
   if (JSON.stringify(newTagList) !== JSON.stringify(assetCatList)) {
     setAssetCatList( Array.from(assetTagNames));    
   }
   const newFailureTagList = Array.from(failureTagNames);
   if (JSON.stringify(newFailureTagList) !== JSON.stringify(failureCatList)) {
     setFailureCatList( Array.from(failureTagNames));    
   }
  
   const newUserList = Array.from(userNames);
  if (JSON.stringify(newUserList) !== JSON.stringify(userList)) {
    setUserList( Array.from(userNames));    
  }
  }, []);
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


const { execute:executeTag } = useAction(createTag, {
  onSuccess: (data) => {
    toast.success(`Tag "${data.name}" created`);
    //formRef.current?.reset();
  },
  onError: (error) => {
    toast.error(error);
  },
});



  Cookies.set('originString', origin)  
  
  useEffect(() => {
    // filter
    let assetsPostTag = assets
    if (uniqueBoardId.length>0){
      assetsPostTag = assets?.filter(x=>(x.id==uniqueBoardId.trim()))
    }
    
    if (searchTerm !== "") {
        let arrFirst =searchTerm.split(';');
        const arr = arrFirst.filter(element => element);  // Using arrow function (ES6)
       //1-------------Filter tags first---------------------------
       //1a......
        if (category !=='') {
            let xy= category.split(',')
            assetsPostTag = assetsPostTag.filter((asset) => (
                  xy.every((s)=>(asset?.assetCatIDs.includes(s.trim())))
            )
            );
        }
        //1b.....//
        if (failureCategory !=='') {
          let xy= failureCategory.split(',')
         // toast.message(`failure tag: ${xy}`)
       
          assetsPostTag = assetsPostTag?.map((asset) => ({
                                  ...asset,
                                  failures:  asset?.failures.filter((xfail) => (        
                                        xy.every((s)=>(xfail?.failureTagIDs.includes(s.trim())))
                                  )),
                              })
                         );
          //filter out those without found search
          assetsPostTag=assetsPostTag.filter((assetx) => (assetx.failures.length>0))
           
        }
      //--------------filter asset search-----------------------------
        const results = assetsPostTag.filter((xasset) =>
            (
              arr.some(// either ;
                (x)=>
                  (
                    //and ,
                    x.split(',').every((s)=>(xasset.name.toLowerCase().includes(s.trim().toLowerCase())))
                  )
              )
            )
        );
        setFilteredassets(results);
    } else {
  
      if (category !=='') {
            let xy= category.split(',')
            //  toast.message(`${xy}`)
            assetsPostTag = assetsPostTag.filter((asset) => (
                    xy.every((s)=>(asset?.assetCatIDs.includes(s.trim())))

            ));
      }
      if (failureCategory !=='') {
          let xy= failureCategory.split(',')
        //  toast.message(`failure tag: ${xy}`)
          assetsPostTag = assetsPostTag?.map((asset) => ({
                            ...asset,
                            //child of asset
                            failures: asset?.failures.filter((xfail) => (        
                                        xy.every((s)=>(xfail?.failureTagIDs.includes(s.trim())))
                                    )),
                            })
                          );
           //filter out those without found search
           assetsPostTag=assetsPostTag.filter((assetx) => (assetx.failures.length>0))
                
       }
      setFilteredassets(assetsPostTag);
    }
  }, [assets,category,uniqueBoardId, failureCategory]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const { width, height } = useWindowSize();
  const mobileWidth =400

 let allowedRoles:String[]
 allowedRoles=['employee','admin','visitor', 'manager', 'test']
 const isAllowedAccess = currentUser?.roles.filter((role: string) =>
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
 
 const calculatePageSlice = (fList?: SafeAsset[], itemOffset?: number, pageSize?: number): SafeAsset[] | undefined => {
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
               key={'andgwgw!'}
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
           key={'abanansgd'}
           onChange={(e) => handlePageSizeChange(e.target.value as PageSizeOption)}
       >
           <option value="1" >1 per Page</option>
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
   return <div  className="flex justify-center gap-3">{buttons}</div>;
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
  let boardListFilterCard: SafeAsset[];
  let arrFirst =searchTerm.split(';');
  const arr = arrFirst.filter(element => element);  // Using arrow function (ES6)
  if (searchTerm !== "") {
    let boardListCardOverdue = filteredassets.map((board) => ({
      ...board,
      //Change lists
      // lists:board.lists.map((list)=>({
      //     ...list,
      //     //filter cards belonging to list
      //     cards: list.cards.filter((card)=>{
      //      let overdueBooleen=true;
      //      //A:Overdue or all
      //      //B: Non overdue or ALL
      //      if (inverseState==true){
      //        if (overdueState==true){
      //          const today = new Date();             
      //          const daysLeft = card?.dueDate? differenceInDays(card?.dueDate, today):1;
      //          const pending_ =card?.progress?card.progress=='complete'?false:true:false
      //          if ((daysLeft < 0) && pending_==true) {
      //              //.....overdue
      //              overdueBooleen=false;
      //          }else{
      //            // not overdue
      //             overdueBooleen=true;
      //          }
      //        }
         
      //      }else{
      //        if (overdueState==true){
      //          /* 1....Due Date variables    Yes✓    False
      //             2. ...Due date pass        True✓   False
      //             3. ...Progress variable    Yes✓     NO
      //             4..... Progress Not complete True✓   False
      //             5.   Overdue== 1&2&3&4
      //             6  if overdue return true other return false
      //          */
      //          const today = new Date(); 
      //          //diffenceInDay(LaterDate, today)   >> 0 , negative == overdue        
      //          const daysLeft = card?.dueDate? differenceInDays(card?.dueDate, today):1;
      //          const pending_ =card?.progress?card.progress=='complete'?false:true:false
      //          if ((daysLeft < 0) && pending_==true) {
      //              //.....overdue
      //              overdueBooleen=true;
      //          }else{
      //            // not overdue
      //             overdueBooleen=false;
      //          }
      //        }
      //      }

      //      let recentQBooleen=true;
      //      // A: get all recent cards or All cards
      //      // B: gell all old cards or All cards
      //      if (recentQ==true){
      //        const today = new Date();             
      //        const dateA = new Date(card.updatedAt);
      //        const daysLeft =  differenceInDays(dateA, today)
      //        if (inverseState==true){
      //          if (daysLeft <  -recentDays)  {
      //            recentQBooleen=true;
      //          }else{
      //            recentQBooleen=false
      //          }

      //        }else{
      //          if (daysLeft >  -recentDays)  {
      //            recentQBooleen=true;
      //          }else{
      //            recentQBooleen=false
      //          }
      //        }
      //      }

      //      let taskBoolean=true;
      //      //filter out completed tasks and those without tages
      //      //A: completed tasks or ALL
      //      //B: uncomplted tasks or ALL
      //      if (inverseState==true){
      //        if (completedTasks==true){
      //          //B state
      //          const CompleteStatus =card?.progress?card.progress=='complete'?true:false:false
      //          if (CompleteStatus ==false)  {
      //            //remove all that are uncompleted
      //            taskBoolean=false;
      //          }
      //        }
      //      }else{
      //        if (completedTasks==true){
      //          const completeStatus =card?.progress?card.progress=='complete'?true:false:true
      //          if (completeStatus ==true)  {
      //            //remove allbthatvare completed
      //            taskBoolean=false;
      //          }
      //        }
      //      }
            
      //        return ( card.active && overdueBooleen && recentQBooleen && taskBoolean)
           
      //     })
      // })
      // ),
     }));
     //removes the cards that dont fall inside
   //  boardListCardOverdue= boardListCardOverdue.filter((board) => (board.lists.length>0))
  
     // Keep board that meet criteria
      const keepBoardMeetingCriterion = boardListCardOverdue.filter((board) =>
          ( // Board Title
            arr.some(
              (x)=>
                (
                  x.split(',').every((s)=>(board.name.toLowerCase().includes(s.trim().toLowerCase())))
                )
            )
          
          //  ||
          //   //Keep board with  list title, or card title or card description that meet condition
          //   board.lists.some(
          //     ( x_list)=>(
          //            (// List Title
          //               arr.some(
          //                 (x)=>
          //                   (
          //                     x.split(',').every((s)=>(x_list.title.toLowerCase().includes(s.trim().toLowerCase())))
          //                   )
          //               )

          //               ||

          //               x_list.cards.some(
          //                 ( x_card)=>(
          //                   //Search Card Title or card description
          //                   arr.some(
          //                     (x)=>
          //                       (
          //                         x.split(',').every((s)=>(x_card.title.toLowerCase().includes(s.trim().toLowerCase())))
          //                         ||
          //                         x.split(',').every((s)=>(x_card.description?.toLowerCase().includes(s.trim().toLowerCase())))
                              
          //                       )
          //                   )
                          
          //                 )// Return clossing bracket
          //               )
          //             )
          //         // )
          //     )// Return clossing bracket
          //   )
          )
       
      );
      // keep list that meet criterion
      const boardFilterList = keepBoardMeetingCriterion.map((board) => ({
        ...board,
        //Change lists
        // lists:board.lists.filter((list)=>
        //     (
        //       (
        //           arr.some(
        //             (x)=>
        //             (
        //               x.split(',').every((s)=>(list.title.toLowerCase().includes(s.trim().toLowerCase())))
                  
        //             )
        //           )
                
        //           ||

        //           //Search Card Title
        //           list.cards.some(
        //             ( x_card)=>(
        //                 arr.some(
        //                   (x)=>
        //                   (
        //                     x.split(',').every((s)=>(x_card.title.toLowerCase().includes(s.trim().toLowerCase())))
        //                     ||
        //                     x.split(',').every((s)=>(x_card.description?.toLowerCase().includes(s.trim().toLowerCase())))
                
        //                   )
        //                 )
        //             )// Return clossing bracket
        //           )
        //       )  
        //     )
        // )
      })
      );
       // keep cards tha meet criterion.
      boardListFilterCard = boardFilterList.map((board) => ({
        ...board,
        //Change lists
        // lists:board.lists.map((list)=>({
        //   ...list,
        //   //filter cards belonging to list
        //   cards: list.cards.filter((card)=>
        //     (
        //       //Search Card Title
        //       arr.some(
        //         (x)=>
        //         (
        //           x.split(',').every((s)=>(card.title.toLowerCase().includes(s.trim().toLowerCase())))
        //             ||
        //           x.split(',').every((s)=>(card.description?.toLowerCase().includes(s.trim().toLowerCase())))
        
        //         )
        //       )
          

        //     )
        //   )
        // })
        // ),
      })
      );
    
      const boardListCardFinal= boardListFilterCard.map((board) => ({
        ...board,
        //remov empty list
      //  lists:board.lists.filter((list)=>( list.cards.length>0)),
       }));
          
          if (listState==true){
            setFList(boardListCardFinal)//sortDates(boardListCardFinal));
          }else{
            //const boardListCardFinal2= boardListCardFinal.filter((board) => (board.lists.length>0))
            setFList(boardListCardFinal)//sortDates(boardListCardFinal2));
          } 
   
  } else {
      const boardListCardOverdue = filteredassets.map((board) => ({
       ...board,
       //Change lists
      //  lists:board.lists.map((list)=>({
      //      ...list,
      //      //filter cards belonging to list
      //      cards: list.cards.filter((card)=>{

      //       let overdueBooleen=true;
      //       //A:Overdue or all
      //       //B: Non overdue or ALL
      //       if (inverseState==true){
      //         if (overdueState==true){
      //           // all those that are not overdue
      //           const today = new Date();             
      //           const daysLeft = card?.dueDate? differenceInDays(card?.dueDate, today):1;
      //           const pending_ =card?.progress?card.progress=='complete'?false:true:false
      //           if ((daysLeft < 0) && pending_==true) {
      //               //.....overdue
      //               overdueBooleen=false;
      //           }else{
      //             // not overdue
      //              overdueBooleen=true;
      //           }
      //         }
          
      //       }else{
      //         if (overdueState==true){
      //           /* 1....Due Date variables    Yes✓    False
      //              2. ...Due date pass        True✓   False
      //              3. ...Progress variable    Yes✓     NO
      //              4..... Progress Not complete True✓   False
      //              5.   Overdue== 1&2&3&4
      //              6  if overdue return true other return false
      //           */
      //           const today = new Date(); 
      //           //diffenceInDay(LaterDate, today)   >> 0 , negative == overdue        
      //           const daysLeft = card?.dueDate? differenceInDays(card?.dueDate, today):1;
      //           const pending_ =card?.progress?card.progress=='complete'?false:true:false
      //           if ((daysLeft < 0) && pending_==true) {
      //               //.....overdue
      //               overdueBooleen=true;
      //           }else{
      //             // not overdue
      //              overdueBooleen=false;
      //           }
      //         }
      //       }
          
      //       let recentQBooleen=true;
      //       // A: get all recent cards or All cards
      //       // B: gell all old cards or All cards
      //       if (recentQ==true){
      //         const today = new Date();             
      //         const dateA = new Date(card.updatedAt);
      //         const daysLeft =  differenceInDays(dateA, today)
      //         if (inverseState==true){
      //           if (daysLeft <  -recentDays)  {
      //             recentQBooleen=true;
      //           }else{
      //             recentQBooleen=false
      //           }

      //         }else{
      //           if (daysLeft >  -recentDays)  {
      //             recentQBooleen=true;
      //           }else{
      //             recentQBooleen=false
      //           }
      //         }
      //       }

      //       let taskBoolean=true;
      //       //filter out completed tasks and those without tages
      //       //A: completed tasks or ALL
      //       //B: uncomplted tasks or ALL
      //       if (inverseState==true){
      //         if (completedTasks==true){
      //             //B state
      //             const CompleteStatus =card?.progress?card.progress=='complete'?true:false:false
      //             if (CompleteStatus ==false)  {
      //               //remove all that are uncompleted
      //               taskBoolean=false;
      //             }
      //         }
      //       }else{
      //         if (completedTasks==true){
      //           const completeStatus =card?.progress?card.progress=='complete'?true:false:true
      //           if (completeStatus ==true)  {
      //             //remove allbthatvare completed
      //             taskBoolean=false;
      //           }
      //         }
      //       }

          
      //     return ( card.active && overdueBooleen && recentQBooleen && taskBoolean)
        
      //      })
      //  })),
      }));
      const boardListCardFinal= boardListCardOverdue.map((board) => ({
        ...board,
        //remov empty list
      //  lists:board.lists.filter((list)=>( list.cards.length>0)),
       }));
          //  keep assets which matches board title.....
    if (listState==true){
      setFList(boardListCardFinal)//sortDates(boardListCardFinal));
    }else{
      //const boardListCardFinal2= boardListCardFinal.filter((board) => (board.lists.length>0))
      setFList(boardListCardFinal)//sortDates(boardListCardFinal2));
    } 

  }

},[filteredassets,overdueState,recentQ,completedTasks, inverseState, searchTerm,listState])

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

let title_= `Assets ${fList.length} of ${assets.length}`

 let subtitle_="Assets created by you" //"Manage your projects and teams online"

 if (origin!=='myprojects'){
   if (origin=='pinnedprojects'){
    title_= `Pinned Projects ${fList.length} of ${assets.length}`
    subtitle_="Pinned Cards"
    // collapsedState===
  
   }else if(origin=='taggedprojects'){
    title_= `Tagged Projects ${fList.length} of ${assets.length}`
    subtitle_="Tagged Cards"
    // collapsedState=true
  
   }
   else{
     title_= `Assets ${fList.length} of ${assets.length}`
     subtitle_="Available Assets"
   }
 }

// Note: these aren't very good regexes, don't use them!
 if (isAllowedAccess?.length==0) return redirect('/denied') 
 if(!currentUser)return redirect('/denied')

  return (
    <Container >
     <div className="mt-[-40px] flex flex-col  sm:flex-col  justify-between sm:px-1 xs:px-2">          
        <Heading
          title={uniqueBoardId.length==0?title_:'Project View mode. To exit, either click here or on the project image.'}
          subtitle={subtitle_} 
          isSetBackground={uniqueBoardId?.length>0||(origin=='pinnedprojects')||(origin=='taggedprojects')}
          setUniqueBoardId={setUniqueBoardId}
        />
        <div className={cn("flex gap-1",isMobile?'flex-col':'flex-row justify-between')}>
          <div className="flex flex-row ">
          {/*   <SaveExcelMutliple data={fList} disabled={false} fileName={`${origin}_${currentUser.email}_`}/>
           */}  <Search 
               // handleSearch ={handleSearch} 
                setSearchTerm={setSearchTerm} 
                searchTerm = {searchTerm}
                placeholderText={'Filter asset'}
            />  
          </div>
          <div 
            className={cn("flex w-full mt-1 z-51 sm:mt-10 rounded-lg flex-col gap-1" ,isMobile?'py-2':'')}
          >
              <FilterSection
                setCategory={(category) =>{ 
                  setCategory(category?category:'');
                }}
     
                productCategories_options={assetTagNames}
                category={category.length>0?category:null}//categoryLocal2}          
                isFullwidth= {isMobile?true:false}  
                placeholder="Filter by asset category" 
                isDisabled={false}      
              />

             {failureCategory.length>0 && <FilterSection
                setCategory={(failureCategory) =>{ 
                  setFailureCategory(failureCategory?failureCategory:'');
                }}
     
                productCategories_options={failureTagNames}
                category={failureCategory.length>0?failureCategory:null}//categoryLocal2}          
                isFullwidth= {isMobile?true:false}  
                placeholder="Filter by failure tag" 
                isDisabled={false}      
              />
               }
                                  
          </div>
        </div>
     </div>
     <div className={cn("mt-1 pb-5",uniqueBoardId.length==0?'':'shadow-xl rounded-md p-1 border-yellow-400 border-2')}>{/* space-y-4 pb-10*/}
        <div>
             
              <div 
                  className={cn(
                    failureCategory?.length>0? "border border-yellow-300 rounded-sm":"",
                    isMobile?'grid grid-cols-1':'grid grid-cols-1'
                  )}
                >
                  {fListPage.map((assetx, index) => (
                            <div 
                              className=""       
                              key={ assetx.id   }
                            >
                                <PageView 
                                  asset={assetx}
                                  currentUser={currentUser}
                                  index={index}
                                  assetTagNames={assetTagNames}
                                  failureTagNames={failureTagNames}
                                  userNames={userNames}
                                  setCategory={setCategory}
                                  setFailureCategory={setFailureCategory}
                                  initialEditingState={initialCollapseState}
                                />
                            </div>
                    ))}
                  <Button 
                        className="mt-2 h-auto px-2 py-1.5 max-w-[150px] justify-end text-muted-foreground text-[14px] hover:text-lg"
                        size="sm"
                        variant="secondary"
                        onClick={() => assetModal.onOpen('')}
                    > Add New Asset
                   </Button>
                                   
                  <div>
                      {fList && fList.length > 0 && ( 
                          <div className="mt-4  max-w-9 flex flex-wrap  gap-1">{renderPaginationButtons()}
                                
                          </div> 
                        )} 
                      {!fList && <p>Loading data...</p>} 
                        
                  </div>
              </div>
            
        </div>
     </div>  
    </Container>
   );
}
 
export default AssetsClient;


