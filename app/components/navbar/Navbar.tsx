import { SafeUser } from "../../../app/types";

// import Categories from "./Categories";
import Container from "../Container";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";

interface NavbarProps {
  currentUser?: SafeUser | null;
}

const Navbar: React.FC<NavbarProps> = ({
  currentUser,
}) => {
  return ( 
    <div className="fixed w-full bg-white z-10 shadow-sm">
      <div
        className="
          border-b-[1px]
        "
      >
      <Container>
        <div 
          className="
            flex 
            flex-row 
            items-center 
            justify-between
            gap-2
            md:gap-0
          "
        >
          <Logo currentUser={currentUser}/>
          <Search currentUser={currentUser} />
          <UserMenu currentUser={currentUser} />
        </div>
      </Container>
    </div>
  </div>
  );
}


export default Navbar;