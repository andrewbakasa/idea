
import EmptyState from "../../app/components/EmptyState";
import ClientOnly from "../../app/components/ClientOnly";

import getCurrentUser from "../../app/actions/getCurrentUser";
import AssetsClient from "./AssetClient";
import getTagNames from "../actions/getTagNames";
import getUserNames from "../actions/getUserNames";
import getAssets from "../actions/getAssets";
import getAssetCategoryNames from "../actions/getAssetCategoryNames";
import getFailureTags from "../actions/getFailureTags";
import getFailureCategoryNames from "../actions/getFailureCategoryNames";


const ProjectsPage = async () => {
  const currentUser = await getCurrentUser();
  const assetTagNames =await getAssetCategoryNames()
  const userNames =await getUserNames()
  
  const failureTagNames =await getFailureCategoryNames()
  console.log('here:', failureTagNames)
 
  

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
  let assets:any
   assets = await getAssets();


  
  return (
    <ClientOnly>
      <AssetsClient
        assets={assets}
        currentUser={currentUser}
        origin= 'assets'
        assetTagNames ={assetTagNames}
        failureTagNames={failureTagNames}
        userNames ={userNames}
      
      />
    </ClientOnly>
  );
}
 
export default ProjectsPage;


