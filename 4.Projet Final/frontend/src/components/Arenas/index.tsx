import { useState } from "react";
import CreateArena from "./Create";
import { ArenaList } from "./List";

export default function ArenaPages() {
  const [displayForm, setDisplayForm] = useState(false);

  if (displayForm) {
    return <CreateArena setDisplayForm={setDisplayForm} />;
  }

  return <ArenaList setDisplayForm={setDisplayForm} />;
}
