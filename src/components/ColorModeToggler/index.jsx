import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useColorMode, Button } from "@chakra-ui/react";

export const ColorModeToggler = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const onColorModeChange = () => {
    toggleColorMode();
    const currentColorMode =
      localStorage.getItem("colorMode") === "light" ? "dark" : "light";
    localStorage.setItem("colorMode", currentColorMode);
  };

  return (
    <div>
      <Button onClick={onColorModeChange}>
        {colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
      </Button>
    </div>
  );
};
