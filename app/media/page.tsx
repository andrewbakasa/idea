// MediaPage.js
'use server'; // Mark as server component
import getCurrentUser from "../../app/actions/getCurrentUser";
import getUserNames from "../actions/getUserNames";
import ClientOnly from "../components/ClientOnly";
import MediaClient from "./MediaClient";
import getTagNames from "../actions/getTagNames";



const MediaPage = async () => {
  const currentUser = await getCurrentUser();
  const userNames = await getUserNames();
  
  
  const tagNames =await getTagNames()
 
  return (
    <ClientOnly>
      <MediaClient 
            currentUser={currentUser}
            tagNames={tagNames}
            userNames={userNames}
           origin="media"
       />
    </ClientOnly>
  );
};

export default MediaPage;


// 'use client'
// MediaPage.tsx
// import { useSearchParams } from 'next/navigation';
// import getCurrentUser from "../../app/actions/getCurrentUser";
// import getUserNames from "../actions/getUserNames";
// import ClientOnly from "../components/ClientOnly";
// import MediaClient from "./MediaClient";
// import getTagNames from "../actions/getTagNames";
// import MediaLayout from './layout';
// // import MediaLayout from './MediaLayout'; // Import the layout

// const MediaPage = async () => {
//   const currentUser = await getCurrentUser();
//   const userNames = await getUserNames();
//   const tagNames = await getTagNames();
//   const searchParams = useSearchParams();
//   const cardId = searchParams?.get("cardId");


//   return (
//     <ClientOnly>
//       <MediaLayout cardId={cardId}> {/* Pass cardId to the layout */}
//         <MediaClient
//           currentUser={currentUser}
//           tagNames={tagNames}
//           userNames={userNames}
//           origin="media"
//         />
//       </MediaLayout>
//     </ClientOnly>
//   );
// };

// export default MediaPage;