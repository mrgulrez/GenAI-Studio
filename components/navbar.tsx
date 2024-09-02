import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import MobileSideBar from "./ui/mobile-sidebar";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-4">
      <MobileSideBar />
      <div className="flex w-full justify-end">
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
