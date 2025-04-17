import { Board, BoardView, Card, CardImage, CardToUser, Comment, List } from "@prisma/client";

export type ListWithCards = List & { cards: Card[] };
export type ListWithCards2 = List & { cards: CardWithList2[] };
export type SafeListWithCards3 = List & { cards: SafeCardWithList2[] };

export type CardWithList = Card &
 { list: List }
// {list: List 
//   taggedUsers: CardToUser[];
// };
export type SafeCardWithList = Omit<
  Card, 
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
} &
{ list: List }


export type CardWithList2 = Card & {
    list: List & {
      board: Board;
    };
    taggedUsers: CardToUser[];
    comments:Comment[];
    cardImages: CardImage[];
  };


  export type SafeCardWithList2 =  Omit<
  Card, 
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
} & {
    list: List & {
      board: Board;
    };
    taggedUsers: CardToUser[];
    comments:Comment[];
    cardImages: CardImage[];
  
  };

  
export type SafeBoard2 = Omit<
Board, 
"createdAt" | "updatedAt" 
> & {
createdAt: string;
updatedAt: string;
lists: SafeList2 [];
user_image:string;
views:number;
userslist:string[];
};

export type SafeList2 = Omit<
List, 
"createdAt" | "updatedAt"
> & {
createdAt: string;
updatedAt: string;
cards: SafeCardWithList2 []

};

