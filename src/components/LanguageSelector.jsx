import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text
} from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../utils/constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "gray.900";

export const LanguageSelector = ({ language, onSelect }) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        colorScheme="green"
        mb={4}
      >
        {language}
      </MenuButton>
      <MenuList colorScheme="green">
        {languages.map(([lang, version]) => {
          return (
            <MenuItem
              key={lang}
              color={lang === language ? ACTIVE_COLOR : ""}
              bg={lang === language ? "gray.100" : "transparent"}
              _hover={{
                color: ACTIVE_COLOR,
                bg: "gray.100"
              }}
              onClick={() => {
                onSelect(lang);
              }}
            >
              {lang}
              &nbsp;
              <Text
                as="span"
                color="gray.900"
                _dark={{ color: "gray.400" }}
                fontSize="sm"
              >
                ({version})
              </Text>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
};
