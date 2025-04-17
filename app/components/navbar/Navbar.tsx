import { SafeUser } from "../../../app/types";
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
    <div className="fixed w-full bg-white z-50 shadow-sm">
      <div
        className="border-b-[1px]"
      >
      <Container>
        <div 
          className="
            flex 
            flex-row 
            items-center 
            justify-between
            gap-[1px]
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