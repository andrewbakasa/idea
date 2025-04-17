
"use client";
import { cn, getCardsFromSafeBoard, getLatestCard, isNumber} from "@/lib/utils";
import { SafeAsset, SafeFailure, SafeUser } from "@/app/types";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { TopFailureCard } from "./topFailure-card";

interface DeckFailuresProps {
  asset: SafeAsset;
  setFailureCategory: (category: string ) => void;
  failureTagNames:any;
  userNames:any;
  index:string;
  currentUser?:SafeUser |null
  // cardList: SafeCard[]
};

const DeckFailures : React.FC<DeckFailuresProps> = ({
  asset,
  setFailureCategory,
  failureTagNames,
  currentUser,
  // cardList,
  userNames,
  index
}) => {
  useEffect(()=>{

    // if (asset?.failures.length>0){
    //   const latestCard=asset.failures[0]// getLatestCard(cardListLocal)// repetetion in future improve....
    //   const pagnumberLocal:number= 0//cardListLocal?.findIndex((carditem)=>carditem.id==latestCard.id)
    //   setPageNumber(pagnumberLocal)
    //   setCardOnDeck(latestCard)
    // }else{
    //   setCardOnDeck(null)
    // }


  },[])

  useEffect(()=>{

    if (asset?.failures.length>0){
      const latestCard=asset.failures[0]// getLatestCard(cardListLocal)// repetetion in future improve....
      const pagnumberLocal:number= 0//cardListLocal?.findIndex((carditem)=>carditem.id==latestCard.id)
      setPageNumber(pagnumberLocal)
      setCardOnDeck(latestCard)
    }else{
      setCardOnDeck(null)
    }


  },[asset])
  
  // const [cardList,setCardList]=useState<SafeFailure[]>([])
  const [cardOnDeck, setCardOnDeck]=useState<SafeFailure|null>(null)
  const [pageSize, setPageSize] = useState<number>(1); // view only 1 item  
  const [itemOffset, setItemOffset] = useState(0);

  const [pagnumber, setPageNumber] = useState(0);
  const [lastClickedPage, setLastClickedPage] = useState(-1); // Initialize to -1 to indicate no clicks yet
  const [listOwner, setListOwner]=useState('');
   
    // Function to check if a page click has occurred
    const hasPageClickOccurred = () => {
      return lastClickedPage !== -1;
    };
  


const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * pageSize) % asset?.failures.length;
    setItemOffset(newOffset);
    setLastClickedPage(event.selected); // Update the last clicked page
    setPageNumber(event.selected)

};

const calculatePageSlice = (cardList?: SafeFailure[], itemOffset?: number, pageSize?: number): SafeFailure[] | undefined => {
    if (!cardList|| !pageSize) {
      return undefined;
    }
    const endpoint = Math.min(itemOffset! + pageSize!, cardList.length);
    return cardList.slice(itemOffset!, endpoint);
 };

useEffect(() => {
  const pageSlice = calculatePageSlice(asset?.failures, itemOffset, pageSize);
  if (pageSlice && pageSlice?.length>0){
      setCardOnDeck(pageSlice[0])
  }
}, []);

useEffect(() => {
    const pageSlice = calculatePageSlice(asset?.failures, itemOffset, pageSize);
    if (pageSlice && pageSlice?.length>0){
        setCardOnDeck(pageSlice[0])
    }
    //click latest card if nothing has been click
    if (hasPageClickOccurred()){
      // handlePageClick({ selected: pagnumber??0 });
 
    }
    // console.log('here b',pageSlice,cardOnDeck )
  }, [itemOffset,
    //pagnumber,
    cardOnDeck]);

useEffect(()=>{

  
  // const parentList = board.lists?.filter(x=>(x.id==cardOnDeck?.listId))
  // if (parentList){
  //   const listOwner =parentList[0]?.userId||''
  //   setListOwner(listOwner)
  // }
},[cardOnDeck])


const renderPaginationButtons = () => {
    const buttons = [];    
    buttons.push(
        <ReactPaginate
                breakLabel="..."
                containerClassName="shadow border pagination text-lg text-blue-500 justify-center mt-1 mb-1 flex flex-row gap-2" // Tailwind CSS classes
                activeClassName="active bg-orange-300 text-white" // Tailwind CSS classes
                previousLabel="«"
                nextLabel="»"
                key={'aqhwtsfadw'}
                onPageChange={handlePageClick}
                pageRangeDisplayed={asset?.failures?.length<100?3:2}
                pageCount={Math.ceil(isNumber(asset?.failures?.length/pageSize)?asset?.failures?.length/pageSize:0)}
                initialPage={pagnumber}
                renderOnZeroPageCount={null}
        />
    );
    
    
    return <div key={index +"s"} className="flex justify-center gap-3">{buttons}</div>;
  };

    return (
         <>
            <div className="flex justify-start mt-0" 
              key={index + '1'}
             >
                {asset?.failures && asset?.failures.length > 0 && ( 
                    <div className="mt-0  max-w-9 flex flex-wrap">{renderPaginationButtons()}
                        
                    </div> 
                )} 
                {!asset?.failures && <p>Loading data...</p>} 
                
            </div>
           {cardOnDeck 
           && 
           <TopFailureCard
                    data={cardOnDeck} index={index}
                    currentUserId={currentUser?.id||''} 
                    assetId={asset.id}
                    setFailureCategory={setFailureCategory} 
                        
                    tagNames={failureTagNames}
                    userNames={userNames}
                    currentUser={currentUser}
                    pagnumber ={pagnumber}
            />}

            {!cardOnDeck && <></>

            }
         </> 
     );
  };

export default DeckFailures
