
import EmptyState from "../../app/components/EmptyState";
import ClientOnly from "../../app/components/ClientOnly";
import getCurrentUser from "../../app/actions/getCurrentUser";
import getBoards from "../actions/getBoards";
import ProjectsClient from "../myprojects/ProjectsClient";

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
  const boards = await getBoards();
  return (
    <ClientOnly>
      <ProjectsClient
        boards={boards}
        currentUser={currentUser}
        origin= 'projects'
      />
    </ClientOnly>
  );
}
 
export default ProjectsPage;


