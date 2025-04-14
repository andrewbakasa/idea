
import EmptyState from "../../app/components/EmptyState";
import ClientOnly from "../../app/components/ClientOnly";

import getCurrentUser from "../../app/actions/getCurrentUser";
import ProjectsClient from "./ProjectsClient";
import getMyBoards from "../actions/getMyBoards";
//import { useOriginSourceUrl } from "@/hooks/use-origin-source";


const ProjectsPage = async () => {
  const currentUser = await getCurrentUser();

  

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login"
        />
      </ClientOnly>
    );
  }

  //const reservations = await getReservations({ userId: currentUser.id });
  const boards = await getMyBoards();


  
  return (
    <ClientOnly>
      <ProjectsClient
        boards={boards}
        currentUser={currentUser}
        origin= 'myprojects'
      />
    </ClientOnly>
  );
}
 
export default ProjectsPage;


