import { useState } from "react";

import { useNavigate, useLocation } from "@remix-run/react";

import { Select } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

export default function PostSort() {
  const [value, setValue] = useState("newest");

  const navigate = useNavigate();

  const { pathname } = useLocation();

  async function handleFilter(e: string) {
    setValue(e);

    // re-navigate to refresh loader and update data
    if (e === "newest") {
      navigate(pathname);
    } else {
      navigate(`?sort=${e}`);
    }
  }

  return (
    <Select
      className="w-24"
      width={"20px"}
      value={value}
      onChange={(e: string) => handleFilter(e)}
      data={[
        { value: "newest", label: "Newest" },
        { value: "oldest", label: "Oldest" },
        { value: "top", label: "Top" },
      ]}
      rightSection={<IconChevronDown size="1rem" />}
      rightSectionWidth={30}
      transitionProps={{
        transition: "pop-top-left",
        duration: 80,
        timingFunction: "ease",
      }}
      styles={() => ({
        rightSection: { pointerEvents: "none" },
        item: {
          "&[data-selected]": {
            "&, &:hover": {
              backgroundColor: "rgb(30 41 59)",
            },
          },
        },
        input: {
          "&:focus": {
            borderColor: "rgb(30 41 59)",
          },
        },
      })}
      radius="md"
    />
  );
}
