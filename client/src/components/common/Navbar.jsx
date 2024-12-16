import { Stack } from "@mui/material";
import { GoHeart, GoHome, GoSearch } from "react-icons/go";
import { TbEdit, TbUserCircle } from "react-icons/tb";

function Navbar() {
  return (
    <>
      <Stack
        flexDirection={"row"}
        maxWidth={"100%"}
        justifyContent={"space-around"}
        alignItems={"center"}
      >
        <GoHome size={32} />
        <GoSearch size={32} />
        <TbEdit size={32} />
        <GoHeart size={32} />
        <TbUserCircle size={32} />
      </Stack>
    </>
  );
}

export default Navbar;
