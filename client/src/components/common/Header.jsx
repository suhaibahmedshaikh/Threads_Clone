import { Stack } from "@mui/material";
import { BsThreads } from "react-icons/bs";
import { RxHamburgerMenu } from "react-icons/rx";
import Navbar from "./Navbar";

function Header() {
  return (
    <>
      <Stack
        flexDirection={"row"}
        height={52}
        justifyContent={"space-around"}
        alignItems={"center"}
        position={"sticky"}
        top={0}
        py={1}
      >
        <BsThreads size={32} />
        <Stack
          justifyContent={"center"}
          width={550}
          bgcolor={"aliceblue"}
          zIndex={2}
          height={96}
        >
          <Navbar />
        </Stack>
        <RxHamburgerMenu size={32} />
      </Stack>
    </>
  );
}

export default Header;
