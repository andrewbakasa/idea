import { SafeBoard, SafeCard } from "@/app/types";
import { ListWithCards } from "@/types";
import { Card } from "@prisma/client";
import { type ClassValue, clsx } from "clsx"
import { differenceInDays } from "date-fns";
import moment from "moment";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// import { type ClassValue, clsx } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
};

export const getFactors =(x:number):number[]=>{
  let factors :number[]=[];
  for (let i = 1; i < Math.floor(x/2)+1; i++) {
    if (x%i==0){// no remainder
      factors.push(x/i)
    }
  }
  factors.push(1)  
  // console.log(`Factors of ${x} : ${factors}`)
  return factors
}
 export const findClosestFactor = (input:number,
                                  factorsOf100:number[]=[1, 2, 4, 5, 10, 20, 25, 50, 100] 
                                  ):number => {
    //descending....
    if (factorsOf100.length==0){
     return 1;
    }
    //sort descending...
    factorsOf100.sort((a,b)=>b-a);
    let closest =factorsOf100[0] ;
    //  getFactors(100)
    //  getFactors(21)
    //  getFactors(30)
  
    for (let factor of factorsOf100) {
      // 100
      // 100, 50
      //100, 50,25,20
      if (factor >= input && factor < closest) {
        //100>=100 && 100<100
        //100>=50 && 100<100; 50>=50 && 50<100
        //100>=16.6 && 100<100; 50>=16.6 && 50<100, 25>=16.6 && 25< 50,... 20>=16.6 && 20<
      
        closest = factor;
        //closest==50
      }
      if (factor<=input){
        //100>==100
        //100>==50,50>=50
        //20>=16.66
        // no need to continue answe fount already
        return closest;
      }
    }
    // setClosestFactor(closest);
    return closest
  };

export const getCardsFromSafeBoard = (data: SafeBoard): SafeCard[] => {
  // Combine all cards from all lists into a single array
  const allCards: SafeCard[] = [];
  data.lists.forEach((list) => allCards.push(...list.cards));
  return allCards;
};

export const getCardsFromLists = (data: ListWithCards[], asc:Boolean=true): Card[] => {
  // Combine all cards from all lists into a single array
  const allCards: Card[] = [];
  data.forEach((list) => allCards.push(...list.cards));
  allCards.sort((a,b)=>{ 
     let a_date= new Date(a.updatedAt)  
     let b_date= new Date(b.updatedAt)  
     if (asc==true){
      //start with oldest
      return(a_date.getTime() - b_date.getTime())
  
     }
    return(b_date.getTime() - a_date.getTime())
  })
  return allCards;
};

// export const getLatestCard2 = (cards: SafeCard[]): SafeCard  => {
//   // Sort cards by updatedAt in descending order
//   const sortedCards = cards?.sort((a, b) => 
//                                 new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//                                );
  
//   return sortedCards[0];
// };

export const getLatestCard = (cards: SafeCard[]): SafeCard  => {
  // Sort cards by updatedAt in descending order
  const sortedCards = cards?.sort((a, b) => 
                                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                               );
  
  return sortedCards[0];
};

export  function sortDates (data:SafeBoard[]){
  //sord board by updatedAt in descending order
  data?.sort(
      (a,b) =>{
             //----------cover for cases there are empy card in all lists of a board----------------
             const a_cards=getCardsFromSafeBoard(a);
             let a_date= new Date(a.updatedAt)  
             if (a_cards.length!==0){
               a_date= new Date(getLatestCard(a_cards).updatedAt) 
             }
             const b_cards=getCardsFromSafeBoard(b);
             let b_date= new Date(b.updatedAt)  
             if (b_cards.length!==0){
               b_date= new Date(getLatestCard(b_cards).updatedAt) 
             }
            //  ------------------------------------------------------------------------------------
             return (b_date.getTime() - a_date.getTime())
           }
      ); // Sort by ascending date
  return data;
  
 }



export function checkStringFromStringArray(yourBigString:string, substringsArray:string[]){
  //console.log(yourBigString, typeof(yourBigString), substringsArray)
  if (yourBigString ===null) {
     return false
  }
   const val =substringsArray.some(substring => yourBigString.toLowerCase().includes(substring.toLowerCase()));
   //console.log(val)
   return  val
}

export function getColorFromPercent(val:number){
  if ( val <= 10) {
    return "#ffc100" ;
  } else if (val <= 25) {
    return "#ff9a00" ;
  } else if (val <= 50) {
    return "#ff7400" ;
  } else if (val <= 75) {
    return "#ff4d00" ;  
  } else {
    return "#ff0000" ;
  }
 
}
export function isNumber(obj: unknown): obj is number {
  return typeof obj === 'number';
}

export function  getTextAreaRow(val:number){
 
  let x:number= Math.floor(val/30) + 1
  //console.log("text:", val, "rows:", x,)
  //clamp 2---10
  return Math.max(2,Math.min(x,10))
  
}

export function getTextAreaHeight(val:number){
  //return only two heights 120:180
  //30 words per line
  //120px = 4lines (each line is 30px)

  // a
  let x:number= Math.floor(val/30)*30 + 30 
  //console.log("text-len: Formulae:", val,x)

  if (val < 100){
    return 100
  }else {
    return 180
  }
}
export function areDatesSimilar(date1:string, date2:string, maxDiffInDays:number) {
  // Convert dates to Moment objects if necessary
  const momentDate1 = moment(date1);
  const momentDate2 = moment(date2);

  const diffInDays = momentDate2.diff(momentDate1, 'days');
  return Math.abs(diffInDays) <= maxDiffInDays;
}
export function getDateTodayYesterdayORFormatedDate(inputX:string){
  const today = new Date();             
  const dateA = new Date(inputX);
  const returnDate =moment(dateA).format('MMMM Do, YYYY')
  const daysLeft =  differenceInDays(dateA, today)
  if (Math.abs(daysLeft) <  2)  {
    if (Math.abs(daysLeft) ==  0){
     return ' Today'
    }else{
      return ' Yesterday'
    }
  }else {
    return returnDate
  }
 
}

export function isJsonStringEditorCompatible(str:string) {
     
  try {
      JSON.parse(str);
      const xx =JSON.parse(str)
      //console.log('Checking: xx.blocks',xx)
      if ( 'blocks' in xx || 'blockMap' in xx ){
          //console.log("No blocks: what is in side :" ,xx)
         return true
      }
      //console.log('Satisfied')
  } catch (e) {
      //console.log('Error', e.error, str)
      return false;
  }
  return true;
}